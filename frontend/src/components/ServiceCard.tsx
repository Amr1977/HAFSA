import { Link } from 'react-router-dom';

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    price: number;
    currency: string;
    priceUnit: string;
    images: string[];
    city?: string | null;
    governorate?: string | null;
    avgRating: number | null;
    bookingCount: number;
    viewCount: number;
    category: { nameAr: string; nameEn?: string | null };
    provider: { id: string; email?: string | null };
  };
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const img = service.images?.[0];
  const rating = service.avgRating;
  const location = [service.city, service.governorate].filter(Boolean).join('، ') || 'بدون موقع';

  const priceLabel = service.priceUnit === 'FIXED' ? `fix` :
    service.priceUnit === 'HOURLY' ? `/ساعة` :
    service.priceUnit === 'DAILY' ? `/يوم` : '';

  return (
    <Link to={`/services/${service.id}`}
      className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-[#DAA520]/30 transition-all duration-200 group"
    >
      {img ? (
        <div className="h-40 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <img src={img} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      ) : (
        <div className="h-40 bg-gradient-to-br from-[#1B4332]/10 to-[#DAA520]/10 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
          <svg className="w-10 h-10 text-[#DAA520]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m2.25 8.006V8.706m0 0a2.18 2.18 0 01.75-1.661 48.09 48.09 0 016.75-.387m-6.75.387a48.09 48.09 0 016.75-.387M8.25 8.706V6.75a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v.281" />
          </svg>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-[#1B4332] dark:text-gray-100 text-sm line-clamp-1">{service.title}</h3>
          <span className="text-sm font-bold text-[#DAA520] shrink-0">
            {service.price.toLocaleString('ar-EG')} {service.currency}{priceLabel && <span className="text-xs font-normal">{priceLabel}</span>}
          </span>
        </div>

        <p className="text-xs text-[#DAA520] mb-2">{service.category.nameAr}</p>

        <div className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-gray-400">
          {rating !== null && (
            <span className="flex items-center gap-0.5">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              {rating.toFixed(1)}
            </span>
          )}
          <span>{location}</span>
          <span className="mr-auto">{service.bookingCount} حجز</span>
        </div>
      </div>
    </Link>
  );
}
