import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

const typeLabels: Record<string, string> = {
  FEEDBACK: 'اقتراح',
  BUG_REPORT: 'خطأ',
  FEATURE_REQUEST: 'ميزة',
  TESTIMONIAL: 'شهادة',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const limit = 20;

  const fetch = async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (filter) params.set('type', filter);
      const res: any = await api.admin.feedback(params.toString());
      setFeedback(res.feedback || []);
      setTotal(res.total || 0);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetch(); }, [page, filter]);

  const handleApprove = async (id: string) => {
    await api.admin.approveFeedback(id);
    fetch();
  };

  const handleReject = async (id: string) => {
    await api.admin.rejectFeedback(id);
    fetch();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد؟')) return;
    await api.admin.deleteFeedback(id);
    fetch();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1B4332] dark:text-[#DAA520] mb-6">ملاحظات المستخدمين</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['', 'FEEDBACK', 'BUG_REPORT', 'FEATURE_REQUEST', 'TESTIMONIAL'].map((f) => (
          <button key={f} onClick={() => { setFilter(f); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-sm border transition-colors ${
              filter === f
                ? 'bg-[#1B4332] dark:bg-[#DAA520] text-white dark:text-[#1B4332] border-[#1B4332] dark:border-[#DAA520]'
                : 'bg-white dark:bg-gray-700 text-[#374151] dark:text-gray-300 border-[#E5E7EB] dark:border-gray-600'
            }`}>
            {f ? typeLabels[f] : 'الكل'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {feedback.map((fb: any) => (
          <div key={fb.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E5E7EB] dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-[#6B7280] dark:text-gray-300 px-2 py-0.5 rounded">
                  {typeLabels[fb.type] || fb.type}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${statusColors[fb.status] || ''}`}>
                  {fb.status === 'PENDING' ? 'معلق' : fb.status === 'APPROVED' ? 'مقبول' : 'مرفوض'}
                </span>
              </div>
              <span className="text-xs text-[#9CA3AF]">{new Date(fb.createdAt).toLocaleDateString('ar-SA')}</span>
            </div>
            <h4 className="font-medium text-[#1B4332] dark:text-[#DAA520] text-sm">{fb.title}</h4>
            <p className="text-sm text-[#374151] dark:text-gray-300 mt-1 whitespace-pre-wrap">{fb.content}</p>
            {fb.rating && (
              <div className="mt-1 text-amber-400 text-sm">{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</div>
            )}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#E5E7EB] dark:border-gray-700">
              <span className="text-xs text-[#6B7280]">
                {fb.user?.phone || fb.user?.email || 'مستخدم #' + fb.user?.id?.slice(0, 6)}
              </span>
              <div className="flex gap-2">
                {fb.status === 'PENDING' && (
                  <>
                    <button onClick={() => handleApprove(fb.id)}
                      className="px-3 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">قبول</button>
                    <button onClick={() => handleReject(fb.id)}
                      className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded">رفض</button>
                  </>
                )}
                <button onClick={() => handleDelete(fb.id)}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-[#6B7280] dark:text-gray-400 rounded">حذف</button>
              </div>
            </div>
          </div>
        ))}
        {feedback.length === 0 && (
          <p className="text-center py-12 text-sm text-[#6B7280]">لا توجد ملاحظات</p>
        )}
      </div>

      {total > limit && (
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-1.5 text-sm border border-[#E5E7EB] rounded-lg disabled:opacity-50">السابق</button>
          <span className="px-3 py-1.5 text-sm text-[#6B7280]">{page} / {Math.ceil(total / limit)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / limit)}
            className="px-4 py-1.5 text-sm border border-[#E5E7EB] rounded-lg disabled:opacity-50">التالي</button>
        </div>
      )}
    </div>
  );
}
