import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function AdminPosts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 20;

  const fetch = async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set('search', search);
      const res: any = await api.admin.posts(params.toString());
      setPosts(res.posts || []);
      setTotal(res.total || 0);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetch(); }, [page]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنشور؟')) return;
    await api.admin.deletePost(id);
    fetch();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1B4332] dark:text-[#DAA520] mb-6">إدارة المنشورات</h1>

      <div className="mb-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); fetch(); } }}
          placeholder="بحث في المنشورات..."
          className="w-full max-w-md border border-[#E5E7EB] dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-700 text-[#374151] dark:text-gray-200 focus:outline-none focus:border-[#1B4332]" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E5E7EB] dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="text-right p-3 text-sm font-medium text-[#6B7280] dark:text-gray-400">المحتوى</th>
              <th className="text-right p-3 text-sm font-medium text-[#6B7280] dark:text-gray-400">المستخدم</th>
              <th className="text-right p-3 text-sm font-medium text-[#6B7280] dark:text-gray-400">الخصوصية</th>
              <th className="text-right p-3 text-sm font-medium text-[#6B7280] dark:text-gray-400">إعجابات</th>
              <th className="text-right p-3 text-sm font-medium text-[#6B7280] dark:text-gray-400">تعليقات</th>
              <th className="text-right p-3 text-sm font-medium text-[#6B7280] dark:text-gray-400">التاريخ</th>
              <th className="text-center p-3 text-sm font-medium text-[#6B7280] dark:text-gray-400">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p: any) => (
              <tr key={p.id} className="border-t border-[#E5E7EB] dark:border-gray-700">
                <td className="p-3 text-sm max-w-xs truncate">{p.content}</td>
                <td className="p-3 text-sm">{p.user?.phone || p.user?.email || p.user?.id?.slice(0, 8)}</td>
                <td className="p-3 text-sm">{p.privacy}</td>
                <td className="p-3 text-sm">{p._count?.likes ?? 0}</td>
                <td className="p-3 text-sm">{p._count?.comments ?? 0}</td>
                <td className="p-3 text-sm text-[#6B7280]">{new Date(p.createdAt).toLocaleDateString('ar-SA')}</td>
                <td className="p-3 text-center">
                  <button onClick={() => handleDelete(p.id)} className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-sm hover:bg-red-200">حذف</button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-sm text-[#6B7280]">لا توجد منشورات</td></tr>
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
