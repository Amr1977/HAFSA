import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';

export default function AdminReports() {
  const { t } = useTranslation();
  const [reports, setReports] = useState<any[]>([]);
  const [tab, setTab] = useState<'post' | 'profile'>('post');

  useEffect(() => {
    if (tab === 'post') {
      api.admin.postReports()
        .then((res: any) => setReports(res))
        .catch(console.error);
    } else {
      api.admin.reports()
        .then((res: any) => setReports(res))
        .catch(console.error);
    }
  }, [tab]);

  const resolvePost = async (id: string, action?: string) => {
    await api.admin.resolvePostReport(id, action);
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: 'RESOLVED' } : r));
  };

  const resolveProfile = async (id: string) => {
    await api.admin.resolveReport(id);
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: 'RESOLVED' } : r));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1B4332] mb-6">{t('admin.reports.title')}</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button onClick={() => setTab('post')} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${tab === 'post' ? 'text-[#1B4332] border-[#1B4332]' : 'text-gray-500 border-transparent'}`}>
          بلاغات المنشورات
        </button>
        <button onClick={() => setTab('profile')} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${tab === 'profile' ? 'text-[#1B4332] border-[#1B4332]' : 'text-gray-500 border-transparent'}`}>
          بلاغات الملفات
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-16 text-[#6B7280]">{t('admin.reports.noReports')}</div>
      ) : (
        <div className="space-y-4">
          {reports.map((r: any) => (
            <div key={r.id} className="bg-white p-6 rounded-xl shadow-sm border border-[#E5E7EB]">
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium text-[#1B4332]">{r.reason}</p>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                }`}>
                  {r.status}
                </span>
              </div>

              {/* Post report: show reported post + reporter */}
              {tab === 'post' && r.post && (
                <div className="mb-3 space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">المنشور:</span> {r.post.content || '(بدون محتوى)'}</p>
                  <p><span className="font-medium">صاحب المنشور:</span> {r.post.user?.profile?.displayName || 'مستخدم'}</p>
                  <p><span className="font-medium">المُبلغ:</span> {r.reporter?.profile?.displayName || 'مستخدم'}</p>
                  <a href={`/social/post/${r.postId}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-block">
                    عرض المنشور →
                  </a>
                </div>
              )}

              {r.details && <p className="text-sm text-[#6B7280] mb-3">{r.details}</p>}
              <p className="text-xs text-[#6B7280] mb-3">
                {new Date(r.createdAt).toLocaleDateString('ar-SA')}
              </p>

              {r.status === 'PENDING' && (
                <div className="flex gap-2">
                  {tab === 'post' ? (
                    <>
                      <button onClick={() => resolvePost(r.id)} className="px-4 py-2 bg-[#1B4332] text-white rounded-lg text-sm hover:bg-[#2D6A4F]">
                        حل بدون إجراء
                      </button>
                      <button onClick={() => resolvePost(r.id, 'delete_post')} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                        حذف المنشور
                      </button>
                    </>
                  ) : (
                    <button onClick={() => resolveProfile(r.id)} className="px-4 py-2 bg-[#1B4332] text-white rounded-lg text-sm hover:bg-[#2D6A4F]">
                      {t('admin.reports.resolve')}
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
