import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function MyBookings() {
  const [tab, setTab] = useState<'sent' | 'received'>('received');
  const [sent, setSent] = useState<any[]>([]);
  const [received, setReceived] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.services.bookings().then((res: any) => {
      setSent(res.sent || []);
      setReceived(res.received || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (id: string, status: string) => {
    try {
      await api.services.updateBooking(id, status);
      const res = await api.services.bookings();
      setSent(res.sent || []);
      setReceived(res.received || []);
    } catch {}
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      ACCEPTED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      DECLINED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      COMPLETED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      CANCELLED: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
    };
    const labels: Record<string, string> = {
      PENDING: 'قيد الانتظار', ACCEPTED: 'مقبول', DECLINED: 'مرفوض',
      COMPLETED: 'مكتمل', CANCELLED: 'ملغي',
    };
    return <span className={`px-2 py-0.5 rounded text-xs font-bold ${colors[status] || ''}`}>{labels[status] || status}</span>;
  };

  if (loading) return <div className="text-center py-12 text-[#6B7280]">جاري التحميل...</div>;

  const bookings = tab === 'sent' ? sent : received;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4" dir="rtl">
      <h1 className="text-2xl font-bold text-[#1B4332] dark:text-[#DAA520] mb-6">حجوزاتي</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('received')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'received' ? 'bg-[#1B4332] text-white dark:bg-[#DAA520] dark:text-[#1B4332]' : 'border border-[#E5E7EB] dark:border-gray-600 text-[#374151] dark:text-gray-300'}`}
        >
          الطلبات الواردة ({received.length})
        </button>
        <button onClick={() => setTab('sent')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'sent' ? 'bg-[#1B4332] text-white dark:bg-[#DAA520] dark:text-[#1B4332]' : 'border border-[#E5E7EB] dark:border-gray-600 text-[#374151] dark:text-gray-300'}`}
        >
          طلباتي المرسلة ({sent.length})
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12 text-[#6B7280] dark:text-gray-400">لا توجد حجوزات</div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b: any) => (
            <div key={b.id} className="bg-white dark:bg-gray-800 rounded-xl border border-[#E5E7EB] dark:border-gray-700 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-bold text-[#1B4332] dark:text-gray-100">{b.service?.title}</p>
                  {tab === 'received' && b.client?.email && (
                    <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-0.5">من: {b.client.email}</p>
                  )}
                  {b.message && (
                    <p className="text-sm text-[#374151] dark:text-gray-300 mt-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">{b.message}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-[#6B7280] dark:text-gray-400">
                    <span>{b.service?.price?.toLocaleString('ar-EG')} {b.service?.currency}</span>
                    <span>{new Date(b.createdAt).toLocaleDateString('ar-EG')}</span>
                    {statusBadge(b.status)}
                  </div>
                </div>

                {/* Actions */}
                {tab === 'received' && b.status === 'PENDING' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleUpdate(b.id, 'ACCEPTED')}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                    >قبول</button>
                    <button onClick={() => handleUpdate(b.id, 'DECLINED')}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
                    >رفض</button>
                  </div>
                )}
                {tab === 'received' && b.status === 'ACCEPTED' && (
                  <button onClick={() => handleUpdate(b.id, 'COMPLETED')}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors shrink-0"
                  >إتمام</button>
                )}
                {tab === 'sent' && b.status === 'PENDING' && (
                  <button onClick={() => handleUpdate(b.id, 'CANCELLED')}
                    className="px-3 py-1.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-xs hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                  >إلغاء</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
