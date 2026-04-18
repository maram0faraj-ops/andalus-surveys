const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Evaluation = require('./models/Evaluation');

const app = express();

// Middlewares
// Middlewares
// Middlewares
// ✅ تم تبسيط السماح ليعمل مع أي استضافة بدون قيود مزعجة
app.use(cors());
app.use(express.json());

/**
 * تصحيح رابط الاتصال:
 * 1. تمت إزالة كلمة "process.env." من داخل النص البرمجي.
 * 2. تمت إزالة المسافات الزائدة (Space) قبل الاسم "Maram".
 * 3. تم تنظيف الرابط من الرموز الزائدة ليتوافق مع معايير MongoDB Atlas.
 */
const MONGODB_URI = "mongodb+srv://Maram:Alshammari-2312398@cluster1.rffpiqy.mongodb.net/andalus_surveys?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ متصل بنجاح بقاعدة بيانات MongoDB Atlas'))
    .catch(err => {
        console.error('❌ خطأ في الاتصال بقاعدة البيانات:');
        console.error(err.message);
    });

// مسار استقبال التقييمات (API Route)
app.post('/api/evaluations', async (req, res) => {
    try {
        const newEvaluation = new Evaluation(req.body);
        await newEvaluation.save();
        res.status(201).json({ message: 'تم حفظ التقييم بنجاح' });
    } catch (error) {
        console.error('Save Error:', error);
        res.status(400).json({ error: 'فشل في حفظ التقييم' });
    }
});

// مسار لجلب النتائج (Dashboard)
app.get('/api/evaluations', async (req, res) => {
    try {
        const data = await Evaluation.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'خطأ في جلب البيانات' });
    }
});

// السماح لـ Render بتحديد المنفذ تلقائياً
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 الخادم يعمل بنجاح على المنفذ: ${PORT}`);
});