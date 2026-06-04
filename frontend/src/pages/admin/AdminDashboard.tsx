import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

const COLORS = ['#1B4332', '#DAA520', '#2D6A4F', '#B8860B', '#6B7280'];

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    api.admin.dashboard().then(setStats).catch(console.error);
  }, []);

  const roleData = (stats.usersByRole || []).map((r: any) => ({
    name: r.role,
    value: r._count.id,
  }));

  const mainCards = [
    { label: 'إجمالي المستخدمين', value: stats.totalUsers, path: '/admin/users', color: '#1B4332' },
    { label: 'الملفات الشخصية', value: stats.totalProfiles, path: '/admin/profiles', color: '#2D6A4F' },
    { label: 'قيد المراجعة', value: stats.pendingProfiles, path: '/admin/profiles', color: '#B8860B', highlight: true },
    { label: 'المميزين', value: stats.premiumUsers, path: '/admin/users', color: '#DAA520' },
    { label: 'المنشورات', value: stats.totalPosts, path: '/admin/posts', color: '#6B7280' },
    { label: 'المحادثات', value: stats.totalConversations, path: '/admin/messages', color: '#6B7280' },
    { label: 'الرسائل', value: stats.totalMessages, path: '/admin/messages', color: '#6B7280' },
    { label: 'الملاحظات', value: stats.totalFeedback, path: '/admin/feedback', color: '#6B7280' },
  ];

  const quickActions = [
    { label: 'إدارة المستخدمين', desc: 'عرض وإدارة حسابات المستخدمين', path: '/admin/users', icon: '👥' },
    { label: 'مراجعة الملفات', desc: 'مراجعة الملفات الشخصية المعلقة', path: '/admin/profiles', icon: '📋' },
    { label: 'التقارير', desc: 'إدارة البلاغات', path: '/admin/reports', icon: '🚨' },
    { label: 'المنشورات', desc: 'عرض وإدارة المنشورات', path: '/admin/posts', icon: '📝' },
    { label: 'المحادثات', desc: 'مشاهدة المحادثات', path: '/admin/messages', icon: '💬' },
    { label: 'الملاحظات', desc: 'إدارة اقتراحات وملاحظات المستخدمين', path: '/admin/feedback', icon: '💡' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1B4332] dark:text-[#DAA520] mb-6">لوحة التحكم</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {mainCards.map((card) => (
          <Link key={card.label} to={card.path}
            className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-[#E5E7EB] dark:border-gray-700 hover:shadow-md transition-shadow">
            <p className="text-3xl font-bold text-[#1B4332] dark:text-[#DAA520]">{card.value ?? '-'}</p>
            <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-[#E5E7EB] dark:border-gray-700">
          <h3 className="font-semibold text-[#1B4332] dark:text-[#DAA520] mb-4">المستخدمين حسب الدور</h3>
          {roleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                  {roleData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[#6B7280] dark:text-gray-400">لا توجد بيانات</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-[#E5E7EB] dark:border-gray-700">
          <h3 className="font-semibold text-[#1B4332] dark:text-[#DAA520] mb-4">نظرة سريعة</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { name: 'مستخدمين جدد', value: stats.newUsersWeek || 0 },
              { name: 'منشورات جديدة', value: stats.newPostsWeek || 0 },
              { name: 'إعجابات', value: stats.totalLikes || 0 },
              { name: 'تعليقات', value: stats.totalComments || 0 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#1B4332" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick actions */}
      <h3 className="font-semibold text-[#1B4332] dark:text-[#DAA520] mb-4">إجراءات سريعة</h3>
      <div className="grid md:grid-cols-3 gap-4">
        {quickActions.map((a) => (
          <Link key={a.path} to={a.path}
            className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-[#E5E7EB] dark:border-gray-700 hover:border-[#1B4332] dark:hover:border-[#DAA520] transition-all">
            <div className="text-2xl mb-2">{a.icon}</div>
            <h4 className="font-semibold text-[#1B4332] dark:text-[#DAA520]">{a.label}</h4>
            <p className="text-sm text-[#6B7280] dark:text-gray-400 mt-1">{a.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
