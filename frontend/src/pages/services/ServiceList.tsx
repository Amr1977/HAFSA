import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ServiceCard from '../../components/ServiceCard';
import ServiceMap from '../../components/ServiceMap';
import { api } from '../../lib/api';

export default function ServiceList() {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  useEffect(() => {
    api.services.categories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoryId) params.set('categoryId', categoryId);
    if (search) params.set('search', search);
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    api.services.list(params.toString()).then((res) => {
      setServices(res.services);
      setTotal(res.total);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page, categoryId, search]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl mx-auto py-6 px-4" dir="rtl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332] dark:text-[#DAA520]">الخدمات</h1>
          <p className="text-sm text-[#6B7280] dark:text-gray-400">أحدث الخدمات المقدمة من المستخدمين</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowMap(!showMap)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${showMap ? 'bg-[#1B4332] text-white border-[#1B4332] dark:bg-[#DAA520] dark:text-[#1B4332] dark:border-[#DAA520]' : 'border-[#E5E7EB] dark:border-gray-600 text-[#374151] dark:text-gray-300 hover:border-[#1B4332] dark:hover:border-[#DAA520]'}`}
          >
            {showMap ? 'قائمة' : 'خريطة'}
          </button>
          <Link to="/services/new"
            className="px-4 py-2 bg-[#1B4332] dark:bg-[#DAA520] text-white dark:text-[#1B4332] rounded-lg text-sm font-medium hover:bg-[#2D6A4F] dark:hover:bg-[#E6C84A] transition-colors"
          >إضافة خدمة</Link>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="ابحث عن خدمة..."
          className="flex-1 border border-[#E5E7EB] dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-[#374151] dark:text-gray-200 focus:outline-none focus:border-[#1B4332] dark:focus:border-[#DAA520]"
        />
        <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
          className="border border-[#E5E7EB] dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-[#374151] dark:text-gray-200 focus:outline-none focus:border-[#1B4332] dark:focus:border-[#DAA520]"
        >
          <option value="">كل التصنيفات</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>{c.nameAr}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#6B7280] dark:text-gray-400">جاري التحميل...</div>
      ) : services.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[#6B7280] dark:text-gray-400 mb-4">لا توجد خدمات حالياً</p>
          <Link to="/services/new"
            className="px-6 py-3 bg-[#1B4332] dark:bg-[#DAA520] text-white dark:text-[#1B4332] rounded-xl font-medium"
          >أضف أول خدمة</Link>
        </div>
      ) : showMap ? (
        <div className="h-[600px] rounded-xl overflow-hidden border border-[#E5E7EB] dark:border-gray-700">
          <ServiceMap services={services} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {services.map((s) => <ServiceCard key={s.id} service={s} />)}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                className="px-4 py-2 border border-[#E5E7EB] dark:border-gray-600 rounded-lg text-sm disabled:opacity-40 hover:border-[#1B4332] dark:hover:border-[#DAA520] transition-colors"
              >السابق</button>
              <span className="text-sm text-[#6B7280] dark:text-gray-400">صفحة {page} من {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
                className="px-4 py-2 border border-[#E5E7EB] dark:border-gray-600 rounded-lg text-sm disabled:opacity-40 hover:border-[#1B4332] dark:hover:border-[#DAA520] transition-colors"
              >التالي</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
