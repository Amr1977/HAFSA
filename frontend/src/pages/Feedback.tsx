import { useState } from 'react';
import { api } from '../lib/api';

const types = [
  { value: 'FEEDBACK', label: 'اقتراح عام' },
  { value: 'BUG_REPORT', label: 'الإبلاغ عن خطأ' },
  { value: 'FEATURE_REQUEST', label: 'طلب ميزة جديدة' },
  { value: 'TESTIMONIAL', label: 'شهادة للموقع' },
];

export default function Feedback() {
  const [type, setType] = useState('FEEDBACK');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.feedback.submit({ type, title, content, rating: rating || null });
      setSubmitted(true);
    } catch (err) {
      alert('فشل الإرسال. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="text-6xl mb-6">✅</div>
        <h2 className="text-2xl font-bold text-[#1B4332] dark:text-[#DAA520] mb-2">تم استلام ملاحظاتك</h2>
        <p className="text-[#6B7280] dark:text-gray-400 mb-8">نشكرك على وقتك. ملاحظاتك تساعدنا في تحسين حفصة.</p>
        <button onClick={() => { setSubmitted(false); setTitle(''); setContent(''); setRating(0); setType('FEEDBACK'); }}
          className="px-6 py-2 bg-[#1B4332] dark:bg-[#DAA520] text-white dark:text-[#1B4332] rounded-lg">
          إرسال ملاحظة أخرى
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-[#1B4332] dark:text-[#DAA520] mb-2">تواصل معنا</h1>
      <p className="text-sm text-[#6B7280] dark:text-gray-400 mb-8">نحن نرحب باقتراحاتك، الإبلاغ عن الأخطاء، طلب ميزات جديدة، أو مشاركة شهادتك عن عمر.</p>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-[#E5E7EB] dark:border-gray-700 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-[#374151] dark:text-gray-300">نوع الملاحظة</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {types.map((t) => (
              <button key={t.value} type="button" onClick={() => setType(t.value)}
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                  type === t.value
                    ? 'bg-[#1B4332] text-white border-[#1B4332] dark:bg-[#DAA520] dark:text-[#1B4332] dark:border-[#DAA520]'
                    : 'bg-white dark:bg-gray-700 text-[#374151] dark:text-gray-300 border-[#E5E7EB] dark:border-gray-600 hover:border-[#1B4332] dark:hover:border-[#DAA520]'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-[#374151] dark:text-gray-300">العنوان</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required
            className="w-full border border-[#E5E7EB] dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-[#374151] dark:text-gray-200 focus:outline-none focus:border-[#1B4332] dark:focus:border-[#DAA520]"
            placeholder="ملخص قصير لملاحظاتك" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-[#374151] dark:text-gray-300">الوصف</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={5}
            className="w-full border border-[#E5E7EB] dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-[#374151] dark:text-gray-200 focus:outline-none focus:border-[#1B4332] dark:focus:border-[#DAA520] resize-none"
            placeholder={type === 'BUG_REPORT' ? 'صِف الخطأ الذي واجهته بالتفصيل...' : type === 'FEATURE_REQUEST' ? 'صِف الميزة التي تريد إضافتها...' : 'اكتب ملاحظاتك هنا...'} />
        </div>

        {type !== 'BUG_REPORT' && (
          <div>
            <label className="block text-sm font-medium mb-2 text-[#374151] dark:text-gray-300">التقييم</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)}
                  className={`text-2xl transition-colors ${star <= rating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}>
                  ★
                </button>
              ))}
            </div>
          </div>
        )}

        <button type="submit" disabled={loading || !title || !content}
          className="w-full py-2.5 bg-[#1B4332] dark:bg-[#DAA520] text-white dark:text-[#1B4332] rounded-lg font-medium hover:bg-[#2D6A4F] dark:hover:bg-[#E6C84A] disabled:opacity-50 transition-colors">
          {loading ? 'جاري الإرسال...' : 'إرسال'}
        </button>
      </form>
    </div>
  );
}
