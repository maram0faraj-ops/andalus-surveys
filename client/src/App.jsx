import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EmojiSurvey from "../components/EmojiSurvey.jsx";
import Dashboard from "../components/Dashboard.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* المسار الرئيسي: يفتح صفحة الاستبيان للزوار */}
        <Route path="/" element={<EmojiSurvey />} />

        {/* مسار خاص: يفتح لوحة التحكم (محمي بكلمة المرور التي وضعناها) */}
        {/* يمكنكِ الدخول إليه عبر إضافة /admin إلى رابط الموقع */}
        <Route path="/admin" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;