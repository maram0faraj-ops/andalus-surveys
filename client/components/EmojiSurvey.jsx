import React, { useState } from 'react';
import axios from 'axios';
import './EmojiSurvey.css';

// تم حذف أسطر الـ import الخاصة بالصور لحل مشكلة المسارات نهائياً
// الصور سيتم استدعاؤها مباشرة من مجلد public

const AngryIcon = () => (
  <svg viewBox="0 0 100 100" className="custom-emoji">
    <circle cx="50" cy="50" r="50" fill="#FF5D5D" />
    <line x1="30" y1="35" x2="45" y2="45" stroke="white" strokeWidth="5" strokeLinecap="round" />
    <line x1="70" y1="35" x2="55" y2="45" stroke="white" strokeWidth="5" strokeLinecap="round" />
    <path d="M 35 65 Q 50 55 65 65" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
  </svg>
);

const SadIcon = () => (
  <svg viewBox="0 0 100 100" className="custom-emoji">
    <circle cx="50" cy="50" r="50" fill="#FDB052" />
    <circle cx="38" cy="40" r="4" fill="white" />
    <circle cx="62" cy="40" r="4" fill="white" />
    <path d="M 35 65 Q 50 55 65 65" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
  </svg>
);

const SmileIcon = () => (
  <svg viewBox="0 0 100 100" className="custom-emoji">
    <circle cx="50" cy="50" r="50" fill="#4BD3A4" />
    <circle cx="38" cy="40" r="4" fill="white" />
    <circle cx="62" cy="40" r="4" fill="white" />
    <path d="M 35 60 Q 50 70 65 60" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" />
  </svg>
);

const HappyIcon = () => (
  <svg viewBox="0 0 100 100" className="custom-emoji">
    <circle cx="50" cy="50" r="50" fill="#20B888" />
    <circle cx="38" cy="40" r="4" fill="white" />
    <circle cx="62" cy="40" r="4" fill="white" />
    <path d="M 28 55 Q 50 80 72 55 Q 50 70 28 55" fill="white" />
  </svg>
);

const questions = [
  { id: 'organizationRating', text: 'كيف تقيّمين مستوى التنظيم العام للمعرض العلمي من حيث ترتيب الأركان وسهولة التنقّل بينها؟' },
  { id: 'innovationRating', text: 'إلى أي مدى كانت أفكار المشاريع المعروضة مبتكرة ومعبّرة عن مهارات الطالبات وقدراتهنّ العلمية؟' },
  { id: 'understandingRating', text: 'هل ساهم المعرض في تعزيز فهمكِ للتجارب العلمية المعروضة بفضل وضوح الشرح وتفاعل الطالبات؟' },
  { id: 'environmentRating', text: 'ما مدى رضاكِ عن البيئة العامة للمعرض، وتوفّر المعلومات؟' }
];

const emojis = [
  { value: 1, icon: <AngryIcon />, label: 'غير راضٍ' },
  { value: 2, icon: <SadIcon />, label: 'مقبول' },
  { value: 3, icon: <SmileIcon />, label: 'راضٍ' },
  { value: 4, icon: <HappyIcon />, label: 'راضٍ جداً' }
];

const EmojiSurvey = () => {
  const [ratings, setRatings] = useState({
    organizationRating: null,
    innovationRating: null,
    understandingRating: null,
    environmentRating: null,
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmojiSelect = (questionId, value) => {
    setRatings(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(prev => prev + 1);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (Object.values(ratings).includes(null)) return;
    
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/evaluations', ratings);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="survey-wrapper">
        <div className="survey-container success-container">
          <div className="success-icon-svg">
             <HappyIcon />
          </div>
          <h2>شكراً لمشاركتكِ!</h2>
          <p>تم تسجيل تقييمكِ لمعرض زهرة الأندلس بنجاح.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isQuestionAnswered = ratings[currentQuestion.id] !== null;

  return (
    <div className="survey-wrapper">
      <div className="survey-container">
        
        <div className="logos-header">
          {/* استدعاء الشعار مباشرة من مجلد public */}
<img src="/hero.png" alt="شعار المعرض" className="exhibition-logo" />
        </div>

        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="question-content">
          <div className="question-pagination">السؤال {currentQuestionIndex + 1} من {questions.length}</div>
          <h2 className="question-text">{currentQuestion.text}</h2>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="question-block">
            <div className="emojis-wrapper">
              {emojis.map((emoji) => (
                <button
                  key={emoji.value}
                  type="button"
                  className={`emoji-btn ${ratings[currentQuestion.id] === emoji.value ? 'selected' : ''} ${ratings[currentQuestion.id] && ratings[currentQuestion.id] !== emoji.value ? 'dimmed' : ''}`}
                  onClick={() => handleEmojiSelect(currentQuestion.id, emoji.value)}
                >
                  {emoji.icon}
                </button>
              ))}
            </div>
          </div>

          <div className="navigation-buttons">
            <button type="button" className="prev-btn" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
              السابق
            </button>
            {currentQuestionIndex === questions.length - 1 ? (
              <button type="submit" className="submit-btn" onClick={handleSubmit} disabled={isSubmitting || !isQuestionAnswered}>
                إرسال
              </button>
            ) : (
              <button type="button" className="next-btn" onClick={handleNext} disabled={!isQuestionAnswered}>
                التالي
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="school-footer">
        <h3>مدارس الأندلس الأهلية</h3>
        <p>تقنية المعلومات - بالزهراء بنات</p>
      </div>
    </div>
  );
};

export default EmojiSurvey;