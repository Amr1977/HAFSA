import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ServiceMap from '../../components/ServiceMap';
import { api } from '../../lib/api';

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingMsg, setBookingMsg] = useState('');
  const [bookLoading, setBookLoading] = useState(false);
  const [bookError, setBookError] = useState('');
  const [bookSuccess, setBookSuccess] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.services.get(id).then(setService).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!id) return;
    setBookLoading(true);
    setBookError('');
    try {
      await api.services.book(id, bookingMsg);
      setBookSuccess(true);
    } catch (err: any) {
      setBookError(err.message || 'فشل إرسال طلب الحجز');
    } finally {
      setBookLoading(false);
    }
  };

  const handleReview = async () => {
    if (!id || !reviewRating) return;
    setReviewLoading(true);
    setReviewError('');
    try {
      await api.services.addReview(id, reviewRating, reviewContent);
      setReviewRating(0);
      setReviewContent('');
      const updated = await api.services.get(id);
      setService(updated);
    } catch (err: any) {
      setReviewError(err.message || 'فشل إضافة التقييم');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-[#6B7280]">جاري التحميل...</div>;
  if (!service) return <div className="text-center py-12 text-[#6B7280]">الخدمة غير موجودة</div>;

  const priceLabel = service.priceUnit === 'FIXED' ? '' :
    service.priceUnit === 'HOURLY' ? '/ساعة' :
    service.priceUnit === 'DAILY' ? '/يوم' : '';

  return (
    <div className="max-w-4xl mx-auto py-6 px-4" dir="rtl">
      <Link to="/services" className="text-sm text-[#DAA520] hover:text-[#C49520] mb-4 inline-block">&larr; العودة للخدمات</Link>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Images */}
          {service.images?.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {service.images.map((img: string, i: number) => (
                <img key={i} src={img} alt="" className="w-full h-48 object-cover rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-[#1B4332]/10 to-[#DAA520]/10 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center">
              <svg className="w-12 h-12 text-[#DAA520]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m2.25 8.006V8.706m0 0a2.18 2.18 0 01.75-1.661 48.09 48.09 0 016.75-.387m-6.75.387a48.09 48.09 0 016.75-.387M8.25 8.706V6.75a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v.281" />
              </svg>
            </div>
          )}

          {/* Info */}
          <div>
            <h1 className="text-2xl font-bold text-[#1B4332] dark:text-gray-100 mb-2">{service.title}</h1>
            <div className="flex items-center gap-3 text-sm text-[#6B7280] dark:text-gray-400 mb-4">
              <span className="bg-[#DAA520]/10 text-[#DAA520] px-2 py-0.5 rounded text-xs font-bold">{service.category?.nameAr}</span>
              {service.avgRating !== null && (
                <span className="flex items-center gap-0.5">
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  {service.avgRating.toFixed(1)}
                </span>
              )}
              <span>{service.bookingCount} حجز</span>
              <span>{service.viewCount} مشاهدة</span>
            </div>
            <p className="text-[#374151] dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{service.description}</p>
          </div>

          {/* Map */}
          {service.latitude && service.longitude && (
            <div>
              <h3 className="font-bold text-[#1B4332] dark:text-gray-100 mb-2">الموقع</h3>
              <div className="h-52 rounded-xl overflow-hidden border border-[#E5E7EB] dark:border-gray-700">
                <ServiceMap services={[service]} zoom={14} />
              </div>
              {service.address && <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-1">{service.address}</p>}
            </div>
          )}

          {/* Reviews */}
          <div>
            <h3 className="font-bold text-[#1B4332] dark:text-gray-100 mb-4">التقييمات ({service.reviews?.length || 0})</h3>
            {service.reviews?.length === 0 ? (
              <p className="text-sm text-[#6B7280] dark:text-gray-400">لا توجد تقييمات بعد</p>
            ) : (
              <div className="space-y-4">
                {service.reviews?.map((r: any) => (
                  <div key={r.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-amber-400">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      <span className="text-xs text-[#6B7280] dark:text-gray-400">{new Date(r.createdAt).toLocaleDateString('ar-EG')}</span>
                    </div>
                    {r.content && <p className="text-sm text-[#374151] dark:text-gray-300">{r.content}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Add review */}
            <div className="mt-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h4 className="text-sm font-bold text-[#1B4332] dark:text-gray-100 mb-3">أضف تقييمك</h4>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setReviewRating(star)}
                    className={`text-xl transition-colors ${star <= reviewRating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                  >★</button>
                ))}
              </div>
              <textarea value={reviewContent} onChange={(e) => setReviewContent(e.target.value)}
                placeholder="اكتب تعليقك (اختياري)"
                className="w-full border border-[#E5E7EB] dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-[#374151] dark:text-gray-200 mb-2 resize-none"
                rows={3}
              />
              {reviewError && <p className="text-red-500 text-xs mb-2">{reviewError}</p>}
              <button onClick={handleReview} disabled={reviewLoading || !reviewRating}
                className="px-4 py-2 bg-[#1B4332] dark:bg-[#DAA520] text-white dark:text-[#1B4332] rounded-lg text-sm font-medium hover:bg-[#2D6A4F] dark:hover:bg-[#E6C84A] disabled:opacity-50 transition-colors"
              >{reviewLoading ? 'جاري الإرسال...' : 'إرسال التقييم'}</button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#E5E7EB] dark:border-gray-700 p-5 sticky top-24">
            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-[#DAA520]">{service.price.toLocaleString('ar-EG')} {service.currency}</p>
              {priceLabel && <p className="text-xs text-[#6B7280] dark:text-gray-400">{priceLabel}</p>}
            </div>

            {bookSuccess ? (
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <p className="text-green-700 dark:text-green-400 font-medium">تم إرسال طلب الحجز</p>
                <p className="text-xs text-green-600 dark:text-green-300 mt-1">سيتم مراجعة طلبك من قبل مقدم الخدمة</p>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea value={bookingMsg} onChange={(e) => setBookingMsg(e.target.value)}
                  placeholder="أرسل رسالة لمقدم الخدمة (اختياري)"
                  className="w-full border border-[#E5E7EB] dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-[#374151] dark:text-gray-200 resize-none"
                  rows={3}
                />
                {bookError && <p className="text-red-500 text-xs">{bookError}</p>}
                <button onClick={handleBook} disabled={bookLoading}
                  className="w-full py-3 bg-[#1B4332] dark:bg-[#DAA520] text-white dark:text-[#1B4332] rounded-xl font-bold hover:bg-[#2D6A4F] dark:hover:bg-[#E6C84A] disabled:opacity-50 transition-colors"
                >{bookLoading ? 'جاري الإرسال...' : 'طلب حجز'}</button>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-[#E5E7EB] dark:border-gray-600 text-sm text-[#6B7280] dark:text-gray-400 space-y-1">
              {service.city && <p>📍 {service.city}</p>}
              {service.governorate && <p>🏙️ {service.governorate}</p>}
              {service.address && <p>📌 {service.address}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
