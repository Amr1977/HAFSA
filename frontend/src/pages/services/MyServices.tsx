import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';

export default function MyServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    api.services.my().then(setServices).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(fetch, []);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;
    try {
      await api.services.delete(id);
      fetch();
    } catch {}
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      INACTIVE: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      ARCHIVED: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
    };
    const labels: Record<string, string> = { ACTIVE: 'نشط', INACTIVE: 'غير نشط', ARCHIVED: 'مؤرشف' };
    return <span className={`px-2 py-0.5 rounded text-xs font-bold ${colors[status] || ''}`}>{labels[status] || status}</span>;
  };

  if (loading) return <div className="text-center py-12 text-[#6B7280]">جاري التحميل...</div>;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1B4332] dark:text-[#DAA520]">خدماتي</h1>
        <Link to="/services/new"
          className="px-4 py-2 bg-[#1B4332] dark:bg-[#DAA520] text-white dark:text-[#1B4332] rounded-lg text-sm font-medium hover:bg-[#2D6A4F] dark:hover:bg-[#E6C84A] transition-colors"
        >إضافة خدمة</Link>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#6B7280] dark:text-gray-400 mb-4">لا توجد خدمات بعد</p>
          <Link to="/services/new"
            className="px-6 py-3 bg-[#1B4332] dark:bg-[#DAA520] text-white dark:text-[#1B4332] rounded-xl font-medium"
          >أضف خدمتك الأولى</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <div key={s.id} className="bg-white dark:bg-gray-800 rounded-xl border border-[#E5E7EB] dark:border-gray-700 p-4 flex items-center gap-4">
              {s.images?.[0] ? (
                <img src={s.images[0]} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg shrink-0 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#DAA520]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m2.25 8.006V8.706m0 0a2.18 2.18 0 01.75-1.661 48.09 48.09 0 016.75-.387m-6.75.387a48.09 48.09 0 016.75-.387M8.25 8.706V6.75a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v.281" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Link to={`/services/${s.id}`} className="font-bold text-[#1B4332] dark:text-gray-100 hover:text-[#DAA520] transition-colors truncate">{s.title}</Link>
                  {statusBadge(s.status)}
                </div>
                <p className="text-xs text-[#6B7280] dark:text-gray-400">
                  {s.price.toLocaleString('ar-EG')} {s.currency} · {s.category?.nameAr} · {s.bookingCount || 0} حجوزات
                  {s.avgRating !== null && ` · ${s.avgRating.toFixed(1)} ⭐`}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link to={`/services/${s.id}/edit`}
                  className="px-3 py-1.5 border border-[#E5E7EB] dark:border-gray-600 rounded-lg text-xs hover:border-[#1B4332] dark:hover:border-[#DAA520] transition-colors"
                >تعديل</Link>
                <button onClick={() => handleDelete(s.id)}
                  className="px-3 py-1.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-xs hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
