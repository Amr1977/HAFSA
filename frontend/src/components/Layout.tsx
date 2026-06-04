import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useTheme } from '../stores/themeStore';
import { api, photoUrl } from '../lib/api';
import { changeLanguage } from '../i18n';
import { onNewNotification } from '../lib/socket';

export default function Layout() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) { setProfilePhoto(null); return; }
    api.profile.getMy().then((p: any) => {
      const url = p.photos?.[0]?.url || null;
      setProfilePhoto(url);
    }).catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) { setUnreadCount(0); return; }
    api.notifications.list().then((res: any) => {
      setUnreadCount(res.unreadCount || 0);
    }).catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    onNewNotification(() => {
      setUnreadCount((prev) => prev + 1);
    });
  }, []);

  useEffect(() => {
    setUnreadCount(0);
  }, [location.pathname === '/notifications']);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: t('nav.home') },
    ...(isAuthenticated
      ? [
          { path: '/social', label: 'المنشورات' },
          { path: '/profile/my', label: t('profile.my') },
        ]
      : []),
    ...(isAuthenticated && user?.role === 'GROOM'
      ? [
          { path: '/requests', label: t('nav.requests') },
          { path: '/messages', label: t('nav.messages') },
        ]
      : []),
    ...(isAuthenticated && (user?.role === 'GUARDIAN' || user?.role === 'BOTH')
      ? [
          { path: '/browse', label: t('nav.browse') },
          { path: '/requests/sent', label: t('nav.requests') },
          { path: '/messages', label: t('nav.messages') },
        ]
      : []),
    ...(isAuthenticated && user?.role === 'ADMIN'
      ? [
          { path: '/admin', label: 'لوحة التحكم' },
          { path: '/admin/users', label: 'المستخدمين' },
          { path: '/admin/profiles', label: 'الملفات' },
          { path: '/admin/posts', label: 'المنشورات' },
          { path: '/admin/messages', label: 'المحادثات' },
          { path: '/admin/reports', label: 'التقارير' },
          { path: '/admin/feedback', label: 'الملاحظات' },
        ]
      : []),
    ...(isAuthenticated
      ? [{ path: '/feedback', label: 'تواصل معنا' }]
      : []),
  ];

  const close = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Navbar */}
      <nav className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-2xl font-bold text-[var(--color-primary)] font-display">
                {t('app.name')}
              </Link>
              <div className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-medium transition-colors ${
                      isActive(link.path)
                        ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                        : 'text-[var(--color-muted)] hover:text-[var(--color-primary)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme toggle */}
              <button
                onClick={toggle}
                className="p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-pale)] transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="text-sm border border-[var(--color-border)] rounded px-2 py-1 bg-[var(--color-surface)] text-[var(--color-text)]"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
                <option value="ur">اردو</option>
                <option value="fr">Français</option>
              </select>

              {isAuthenticated && (
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-pale)] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[18px] min-h-[18px]">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {isAuthenticated ? (
                <div className="hidden md:flex items-center gap-4">
                  <Link
                    to="/profile/my"
                    className="w-8 h-8 rounded-full overflow-hidden border-2 border-[var(--color-primary)] hover:opacity-80 transition-opacity"
                  >
                    {profilePhoto ? (
                      <img src={photoUrl(profilePhoto)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[var(--color-primary-pale)] flex items-center justify-center text-[var(--color-primary)] text-sm font-bold">
                        {user?.role?.charAt(0) || '?'}
                      </div>
                    )}
                  </Link>
                  <Link
                    to="/settings"
                    className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-primary)]"
                  >
                    {t('nav.settings')}
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm font-medium text-red-500 hover:text-red-600"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-[var(--color-primary)] border border-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-pale)]"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-light)]"
                  >
                    {t('nav.register')}
                  </Link>
                </div>
              )}

              {/* Hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile side drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/40" onClick={close} />
          {/* Drawer */}
          <div className={`fixed top-0 ${i18n.language === 'ar' ? 'left-0' : 'right-0'} h-full w-72 bg-[var(--color-surface)] shadow-xl z-50`}>
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <span className="text-lg font-bold text-[var(--color-primary)]">{t('app.name')}</span>
              <button onClick={close} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="w-6 h-6 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={close}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-[var(--color-primary-pale)] text-[var(--color-primary)]'
                      : 'text-[var(--color-text)] hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {isAuthenticated && (
              <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--color-border)] p-4 space-y-2">
                <Link
                  to="/settings"
                  onClick={close}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-text)] hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('nav.settings')}
                </Link>
                <button
                  onClick={() => { logout(); close(); }}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50"
                >
                  {t('nav.logout')}
                </button>
              </div>
            )}

            {!isAuthenticated && (
              <div className="absolute bottom-0 left-0 right-0 border-t border-[var(--color-border)] p-4 space-y-2">
                <Link
                  to="/login"
                  onClick={close}
                  className="block w-full text-center px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-primary)] border border-[var(--color-primary)]"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={close}
                  className="block w-full text-center px-4 py-3 rounded-lg text-sm font-medium text-white bg-[var(--color-primary)]"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
