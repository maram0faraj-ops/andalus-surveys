import React, { useEffect, useState } from 'react';
import axios from 'axios';
// أضفنا مكون Legend الخاص بمفتاح الخريطة للرسم البياني الجديد
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList, Legend } from 'recharts';
import * as XLSX from 'xlsx';
import './Dashboard.css';

// --- مكون مخصص لرسم النصوص الطويلة داخل الأعمدة بشكل مستقيم ---
const CustomBarLabel = (props) => {
  const { x, y, width, height, value } = props;
  
  if (height < 60) return null; 

  const words = value.split(' ');
  const lines = [];
  for (let i = 0; i < words.length; i += 3) {
    lines.push(words.slice(i, i + 3).join(' '));
  }

  const lineHeight = 22;
  const shift = ((lines.length - 1) * lineHeight) / 2;
  const yPos = y + (height / 2) - shift;

  return (
    <text 
      x={x + width / 2} 
      y={yPos} 
      fill="#ffffff" 
      textAnchor="middle" 
      dominantBaseline="central"
    >
      {lines.map((line, index) => (
        <tspan 
          key={index} 
          x={x + width / 2} 
          dy={index === 0 ? 0 : lineHeight} 
          fontSize={13} 
          fontWeight="bold"
        >
          {line}
        </tspan>
      ))}
    </text>
  );
};

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState([]);
  const [distStats, setDistStats] = useState([]); // 👈 حالة جديدة لتخزين بيانات النسب المئوية
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  const ADMIN_PASSWORD = 'andalus_admin'; 

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('كلمة المرور غير صحيحة!');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        try {
         axios.get('https://andalus-surveys.onrender.com'/api/evaluations);
          processData(response.data);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchData();
    }
  }, [isAuthenticated]);

  const processData = (rawItems) => {
    if (rawItems.length === 0) return;
    
    // أضفنا "short" لاستخدامه كعنوان مختصر في المحور السيني للرسم الجديد
    const keys = [
      { id: 'organizationRating', label: 'ما مدى تقييمك لمستوى التنظيم العام للمعرض؟', short: 'التنظيم' },
      { id: 'innovationRating', label: 'كيف تقيم مستوى الابتكار في المشاريع المعروضة؟', short: 'الابتكار' },
      { id: 'understandingRating', label: 'ما مدى وضوح وتمكن الطالبات من شرح مشاريعهن؟', short: 'وضوح الشرح' },
      { id: 'environmentRating', label: 'ما مدى التقييم للبيئة العامة وتجهيزات مكان المعرض؟', short: 'البيئة العامة' }
    ];

    // 1. حساب المتوسطات (للرسم البياني الأول)
    const averageData = keys.map(key => {
      const average = rawItems.reduce((acc, item) => acc + item[key.id], 0) / rawItems.length;
      return { name: key.label, average: parseFloat(average.toFixed(2)) };
    });

    // 2. حساب تفاصيل الاستجابات بالنسب المئوية (للرسم البياني الثاني)
    const totalResponses = rawItems.length;
    const distributionData = keys.map(key => {
      const counts = { 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 };
      
      // حساب كم شخص اختار كل تقييم
      rawItems.forEach(item => {
        const val = item[key.id];
        if (counts[val] !== undefined) counts[val]++;
      });

      // تحويل الأرقام إلى نسب مئوية
      return {
        name: key.short, // نستخدم الاسم المختصر هنا لتجنب زحمة النصوص
        'ممتاز (4)': parseFloat(((counts[4] / totalResponses) * 100).toFixed(1)),
        'جيد جداً (3)': parseFloat(((counts[3] / totalResponses) * 100).toFixed(1)),
        'جيد (2)': parseFloat(((counts[2] / totalResponses) * 100).toFixed(1)),
        'مقبول (1)': parseFloat(((counts[1] / totalResponses) * 100).toFixed(1)),
      };
    });

    setStats(averageData);
    setDistStats(distributionData);
    setData(rawItems);
  };

  const exportToExcel = () => {
    const formattedData = data.map((item, index) => ({
      'رقم التقييم': index + 1,
      'ما مدى تقييمك لمستوى التنظيم العام للمعرض؟': item.organizationRating,
      'كيف تقيم مستوى الابتكار في المشاريع المعروضة؟': item.innovationRating,
      'ما مدى وضوح وتمكن الطالبات من شرح مشاريعهن؟': item.understandingRating,
      'ما مدى التقييم للبيئة العامة وتجهيزات مكان المعرض؟': item.environmentRating,
      'تاريخ التقييم': new Date(item.createdAt).toLocaleDateString('ar-SA')
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "التقييمات");
    XLSX.writeFile(workbook, "نتائج_تقييم_المعرض.xlsx");
  };

  const COLORS = ['#000080', '#121A5A', '#1A237E', '#283593'];

  if (!isAuthenticated) {
    return (
      <div className="login-wrapper">
        <div className="login-box">
          <img src="/hero.png" alt="Logo" className="login-logo" />
          <h2>لوحة تحكم المعرض</h2>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              placeholder="أدخلي كلمة المرور" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">دخول</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <img src="/hero.png" alt="Logo" className="dash-logo" />
          <h1>نتائج تقييم معرض زهرة الأندلس</h1>
          <p>إجمالي المشاركات: <strong>{data.length}</strong></p>
          <button onClick={exportToExcel} className="export-excel-btn">
            تصدير الردود إلى Excel 📊
          </button>
        </header>

        {/* --- الرسم البياني الأول: المتوسط العام --- */}
        <div className="chart-section">
          <h3 style={{ marginBottom: '20px', color: '#1a237e' }}>المتوسط العام لمستويات الرضا (من 4)</h3>
          <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={false} axisLine={true} tickLine={false} />
                <YAxis domain={[0, 4]} />
                <Tooltip />
                <Bar dataKey="average" radius={[10, 10, 0, 0]}>
                  {stats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  <LabelList dataKey="name" content={<CustomBarLabel />} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- الرسم البياني الثاني: تفصيل الاستجابات بالنسب المئوية --- */}
        <div className="chart-section" style={{ marginTop: '50px' }}>
          <h3 style={{ marginBottom: '20px', color: '#1a237e' }}>تفصيل نسبة الاستجابات لكل معيار (%)</h3>
          <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              {/* رسم بياني مكدس (Stacked) لعرض النسب المئوية */}
              <BarChart data={distStats} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                
                {/* نستخدم الأسماء المختصرة هنا ليكون المحور نظيفاً */}
                <XAxis dataKey="name" tick={{ fontSize: 14, fill: '#1a237e', fontWeight: 'bold' }} />
                
                {/* المحور الصادي ينتهي عند 100% */}
                <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend wrapperStyle={{ paddingTop: '15px' }} />
                
                {/* تدرجات ألوان احترافية لتمثيل مستويات التقييم */}
                <Bar dataKey="ممتاز (4)" stackId="a" fill="#1a237e" />
                <Bar dataKey="جيد جداً (3)" stackId="a" fill="#3949ab" />
                <Bar dataKey="جيد (2)" stackId="a" fill="#7986cb" />
                <Bar dataKey="مقبول (1)" stackId="a" fill="#c5cae9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- كروت الملخص --- */}
        <div className="summary-cards">
          {stats.map((item, index) => (
            <div className="card" key={index} style={{ borderRight: `5px solid ${COLORS[index]}` }}>
              <h4 style={{ fontSize: '1rem', lineHeight: '1.5', marginBottom: '15px', color: '#333' }}>
                {item.name}
              </h4>
              <span className="avg-text">{item.average} / 4</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;