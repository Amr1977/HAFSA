import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';

export default function Landing() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    const dashboardLink = user.role === 'GROOM' ? '/profile/my' : '/browse';
    return (
      <div className="text-center py-16">
        <h1 className="text-4xl font-bold text-[#1B4332] dark:text-[#DAA520] mb-4">
          {t('app.name')}
        </h1>
        <p className="text-lg text-[#6B7280] dark:text-gray-300 mb-8">{t('app.tagline')}</p>
        <Link
          to={dashboardLink}
          className="inline-block px-8 py-3 bg-[#1B4332] text-white rounded-lg text-lg font-medium hover:bg-[#2D6A4F]"
        >
          {user.role === 'GROOM' ? t('profile.my') : t('browse.title')}
        </Link>

          {/* ─── Story teaser section (authenticated) ─── */}
          <div className="max-w-5xl mx-auto mt-20 px-4 text-right" dir="rtl">
            <h2 className="text-2xl font-bold text-[#1B4332] dark:text-[#DAA520] mb-1">من سيرة أمهات المؤمنين</h2>
            <p className="text-sm text-[#6B7280] dark:text-gray-400 mb-6">قصص موثَّقة من أمهات المصادر الإسلامية</p>
            <Link
              to="/siyar/hafsa-bint-umar"
              className="block bg-white dark:bg-gray-800 rounded-xl border-t-4 border-t-[#DAA520] shadow-sm border border-[#E5E7EB] dark:border-gray-600 p-6 text-right no-underline hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#6B7280] dark:text-gray-400">أم المؤمنين</span>
                <span className="text-xs bg-[#1B4332] dark:bg-[#DAA520] text-[#DAA520] dark:text-[#1B4332] px-3 py-1 rounded-full font-medium">السيرة النبوية</span>
              </div>
              <h3 className="text-[22px] font-bold text-[#1B4332] dark:text-gray-100 mb-3">حفصة بنت عمر رضي الله عنها</h3>
              <p className="text-base text-[#6B7280] dark:text-gray-300 leading-relaxed mb-4 line-clamp-3">
                زوجة النبي ﷺ وحافظة القرآن الكريم، ابنة الفاروق عمر بن الخطاب رضي الله عنه. قارئةٌ كاتبةٌ صوَّامةٌ قوَّامة، وصفها جبريل بأنها زوجة النبي ﷺ في الجنة.
              </p>
              <div className="border-t border-[#E5E7EB] dark:border-gray-600 pt-3 text-left">
                <span className="text-[#DAA520] font-medium text-sm">← اقرأ القصة كاملة</span>
              </div>
            </Link>
          </div>

          {/* ─── Open source contribution section (authenticated) ─── */}
          <div className="max-w-5xl mx-auto mt-16 px-4" dir="rtl">
            <div className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 md:p-10 text-center shadow-lg border border-[#DAA520]/20">
              <div className="flex justify-center mb-5">
                <svg viewBox="0 0 16 16" className="w-12 h-12 fill-[#DAA520]">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#F5E6B8] mb-3">مشروع مفتوح المصدر</h2>
              <p className="text-base text-[#B8DFC8] leading-relaxed max-w-2xl mx-auto mb-6">
                حفصة مشروع مفتوح المصدر نسعى من خلاله لخدمة المجتمع الإسلامي. نسعد بانضمامك إلينا في التطوير والتحسين.{' '}
                <br className="hidden sm:inline" />
                fork, issue, أو pull request — كل المساهمات مرحب بها.
              </p>
              <a
                href="https://github.com/Amr1977/HAFSA"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#DAA520] text-[#1B4332] rounded-xl font-bold hover:bg-[#F5E6B8] transition-colors shadow-md"
              >
                <svg viewBox="0 0 16 16" className="w-5 h-5 fill-current">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                GitHub: Amr1977/HAFSA
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (
    <div className="text-center py-20">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-[#1B4332] dark:text-[#DAA520] mb-6 font-display">
          {t('app.name')}
        </h1>
        <p className="text-xl text-[#6B7280] dark:text-gray-300 mb-4">{t('app.tagline')}</p>
        <p className="text-base text-[#6B7280] dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          {t('app.description')}
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/register"
            className="px-8 py-3 bg-[#1B4332] dark:bg-[#DAA520] text-white dark:text-[#1B4332] rounded-lg text-lg font-medium hover:bg-[#2D6A4F] dark:hover:bg-[#F5E6B8] transition-colors"
          >
            {t('nav.register')}
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 border border-[#1B4332] dark:border-[#DAA520] text-[#1B4332] dark:text-[#DAA520] rounded-lg text-lg font-medium hover:bg-[#D8F3DC] dark:hover:bg-[#1B4332] transition-colors"
          >
            {t('nav.login')}
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-24 px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-[#E5E7EB] dark:border-gray-600">
            <div className="w-12 h-12 bg-[#D8F3DC] dark:bg-[#1B4332] rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">👤</span>
            </div>
            <h3 className="text-lg font-semibold text-[#1B4332] dark:text-gray-100 mb-2">
              للراغبين في الزواج
            </h3>
            <p className="text-sm text-[#6B7280] dark:text-gray-300">
              أنشئ ملفك الشخصي وتعرف على الأولياء المهتمين
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-[#E5E7EB] dark:border-gray-600">
            <div className="w-12 h-12 bg-[#D8F3DC] dark:bg-[#1B4332] rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">👪</span>
            </div>
            <h3 className="text-lg font-semibold text-[#1B4332] dark:text-gray-100 mb-2">
              للأولياء
            </h3>
            <p className="text-sm text-[#6B7280] dark:text-gray-300">
              تصفح الملفات الشخصية واختر الأنسب لمن ترعى
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-[#E5E7EB] dark:border-gray-600">
            <div className="w-12 h-12 bg-[#D8F3DC] dark:bg-[#1B4332] rounded-lg flex items-center justify-center mb-4 mx-auto">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="text-lg font-semibold text-[#1B4332] dark:text-gray-100 mb-2">
              تواصل آمن
            </h3>
            <p className="text-sm text-[#6B7280] dark:text-gray-300">
              تواصل مع الطرف الآخر عبر الرسائل النصية الآمنة
            </p>
          </div>
        </div>
      </div>

      {/* ─── Story teaser section (unauthenticated) ─── */}
      <div className="max-w-5xl mx-auto mt-20 px-4 text-right" dir="rtl">
        <h2 className="text-2xl font-bold text-[#1B4332] dark:text-[#DAA520] mb-1">من سيرة أمهات المؤمنين</h2>
        <p className="text-sm text-[#6B7280] dark:text-gray-400 mb-6">قصص موثَّقة من أمهات المصادر الإسلامية</p>
        <Link
          to="/siyar/hafsa-bint-umar"
          className="block bg-white dark:bg-gray-800 rounded-xl border-t-4 border-t-[#DAA520] shadow-sm border border-[#E5E7EB] dark:border-gray-600 p-6 text-right no-underline hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#6B7280] dark:text-gray-400">أم المؤمنين</span>
            <span className="text-xs bg-[#1B4332] dark:bg-[#DAA520] text-[#DAA520] dark:text-[#1B4332] px-3 py-1 rounded-full font-medium">السيرة النبوية</span>
          </div>
          <h3 className="text-[22px] font-bold text-[#1B4332] dark:text-gray-100 mb-3">حفصة بنت عمر رضي الله عنها</h3>
          <p className="text-base text-[#6B7280] dark:text-gray-300 leading-relaxed mb-4 line-clamp-3">
            زوجة النبي ﷺ وحافظة القرآن الكريم، ابنة الفاروق عمر بن الخطاب رضي الله عنه. قارئةٌ كاتبةٌ صوَّامةٌ قوَّامة، وصفها جبريل بأنها زوجة النبي ﷺ في الجنة.
          </p>
          <div className="border-t border-[#E5E7EB] dark:border-gray-600 pt-3 text-left">
            <span className="text-[#DAA520] font-medium text-sm">← اقرأ القصة كاملة</span>
          </div>
        </Link>
      </div>

      {/* ─── Open source contribution section (unauthenticated) ─── */}
      <div className="max-w-5xl mx-auto mt-16 px-4 mb-16" dir="rtl">
        <div className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 md:p-10 text-center shadow-lg border border-[#DAA520]/20">
          <div className="flex justify-center mb-5">
            <svg viewBox="0 0 16 16" className="w-12 h-12 fill-[#DAA520]">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#F5E6B8] mb-3">مشروع مفتوح المصدر</h2>
          <p className="text-base text-[#B8DFC8] leading-relaxed max-w-2xl mx-auto mb-6">
            حفصة مشروع مفتوح المصدر نسعى من خلاله لخدمة المجتمع الإسلامي. نسعد بانضمامك إلينا في التطوير والتحسين.{' '}
            <br className="hidden sm:inline" />
            fork, issue, أو pull request — كل المساهمات مرحب بها.
          </p>
          <a
            href="https://github.com/Amr1977/HAFSA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#DAA520] text-[#1B4332] rounded-xl font-bold hover:bg-[#F5E6B8] transition-colors shadow-md"
          >
            <svg viewBox="0 0 16 16" className="w-5 h-5 fill-current">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            GitHub: Amr1977/HAFSA
          </a>
        </div>
      </div>
    </div>
  );
}
