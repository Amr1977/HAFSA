import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function AdminMessages() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetch = async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      const res: any = await api.admin.conversations(params.toString());
      setConversations(res.conversations || []);
      setTotal(res.total || 0);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetch(); }, [page]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1B4332] dark:text-[#DAA520] mb-6">المحادثات</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E5E7EB] dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="text-right p-3 text-sm font-medium text-[#6B7280] dark:text-gray-400">المشاركون</th>
              <th className="text-right p-3 text-sm font-medium text-[#6B7280] dark:text-gray-400">آخر رسالة</th>
              <th className="text-right p-3 text-sm font-medium text-[#6B7280] dark:text-gray-400">عدد الرسائل</th>
              <th className="text-right p-3 text-sm font-medium text-[#6B7280] dark:text-gray-400">آخر نشاط</th>
            </tr>
          </thead>
          <tbody>
            {conversations.map((c: any) => (
              <tr key={c.id} className="border-t border-[#E5E7EB] dark:border-gray-700">
                <td className="p-3 text-sm">
                  {c.participants?.map((p: any) => p.user?.phone || p.user?.email || p.user?.id?.slice(0, 8)).join(', ') || '-'}
                </td>
                <td className="p-3 text-sm max-w-xs truncate">
                  {c.messages?.[0]?.content || '-'}
                </td>
                <td className="p-3 text-sm">{c._count?.messages ?? 0}</td>
                <td className="p-3 text-sm text-[#6B7280]">
                  {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleDateString('ar-SA') : '-'}
                </td>
              </tr>
            ))}
            {conversations.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-sm text-[#6B7280]">لا توجد محادثات</td></tr>
            )}
          </tbody>
        </table>
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
