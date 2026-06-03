import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { photoUrl } from '../../lib/api';

const DEFAULT_AVATAR = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="#D8F3DC" rx="20"/><text x="20" y="26" text-anchor="middle" fill="#1B4332" font-size="16" font-weight="bold">?</text></svg>');

export default function SocialFeed() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [postPrivacy, setPostPrivacy] = useState<'PUBLIC' | 'PRIVATE' | 'CONNECTIONS' | 'SELECTED'>('PUBLIC');
  const [tab, setTab] = useState<'feed' | 'explore'>('feed');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const privacyLabels: Record<string, string> = {
    PUBLIC: 'عام',
    PRIVATE: 'خاص',
    CONNECTIONS: 'المتابعين',
    SELECTED: 'مختار',
  };

  const fetchPosts = () => {
    setLoading(true);
    const fetcher = tab === 'feed' ? api.social.getFeed(`page=${page}&limit=20`) : api.social.getExplore(`page=${page}&limit=20`);
    fetcher.then((res: any) => {
      setPosts(res.posts);
      setTotalPages(res.totalPages);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPosts(); }, [tab, page]);

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    setSubmitting(true);
    try {
      await api.social.createPost({ content: newPost, privacy: postPrivacy });
      setNewPost('');
      setPage(1);
      fetchPosts();
    } catch (e) {} finally { setSubmitting(false); }
  };

  const handleLike = async (postId: string) => {
    await api.social.toggleLike(postId);
    setPosts(posts.map(p => p.id === postId ? {
      ...p,
      liked: !p.liked,
      _count: { ...p._count, likes: p.liked ? p._count.likes - 1 : p._count.likes + 1 },
    } : p));
  };

  const handleDelete = async (postId: string) => {
    await api.social.deletePost(postId);
    setPosts(posts.filter(p => p.id !== postId));
  };

  const userName = (p: any) => p.user.profile?.displayName || p.user.role;
  const avatar = (p: any) => photoUrl(p.user.profile?.photos?.[0]?.url) || DEFAULT_AVATAR;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-6">
        {tab === 'feed' ? 'آخر المنشورات' : 'استكشف'}
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-[var(--color-border)]">
        <button onClick={() => { setTab('feed'); setPage(1); }} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${tab === 'feed' ? 'text-[var(--color-primary)] border-[var(--color-primary)]' : 'text-[var(--color-muted)] border-transparent'}`}>
          المتابعة
        </button>
        <button onClick={() => { setTab('explore'); setPage(1); }} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${tab === 'explore' ? 'text-[var(--color-primary)] border-[var(--color-primary)]' : 'text-[var(--color-muted)] border-transparent'}`}>
          استكشف
        </button>
      </div>

      {/* Create post */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4 mb-6">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="ما الذي يدور في ذهنك؟"
          className="w-full border-0 resize-none focus:outline-none text-sm h-20"
        />
        <div className="flex items-center gap-3 pt-3 border-t border-[var(--color-border)]">
          <select value={postPrivacy} onChange={(e) => setPostPrivacy(e.target.value as any)} className="text-xs border border-[var(--color-border)] rounded-lg px-2 py-1.5 text-[var(--color-muted)] bg-[var(--color-surface)]">
            <option value="PUBLIC">عام</option>
            <option value="CONNECTIONS">المتابعين</option>
            <option value="PRIVATE">خاص</option>
          </select>
          <span className="text-xs text-[var(--color-muted)]">{newPost.length} حرف</span>
          <button onClick={handleCreatePost} disabled={submitting || !newPost.trim()} className="mr-auto px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--color-primary-light)] disabled:opacity-50">
            {submitting ? 'جاري النشر...' : 'نشر'}
          </button>
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="text-center py-8 text-[var(--color-muted)]">جاري التحميل...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-[var(--color-muted)]">
          <p className="text-lg mb-2">لا توجد منشورات</p>
          <p className="text-sm">{tab === 'feed' ? 'تابع مستخدمين آخرين لرؤية منشوراتهم' : 'كن أول من ينشر!'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <Link to={`/profile/my`} className="flex items-center gap-3">
                  <img src={avatar(post)} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-primary)]">{userName(post)}</p>
                    <p className="text-xs text-[var(--color-muted)]">{new Date(post.createdAt).toLocaleDateString('ar-SA')}</p>
                  </div>
                </Link>
                {post.user.id === localStorage.getItem('user_id') && (
                  <button onClick={() => handleDelete(post.id)} className="text-xs text-red-400 hover:text-red-600">حذف</button>
                )}
              </div>

              {/* Privacy badge */}
              {post.privacy && post.privacy !== 'PUBLIC' && (
                <div className="mb-2">
                  <span className="inline-block text-xs bg-gray-100 dark:bg-gray-700 text-[var(--color-muted)] px-2 py-0.5 rounded">
                    {privacyLabels[post.privacy] || post.privacy}
                  </span>
                </div>
              )}

              {/* Content */}
              <Link to={`/social/post/${post.id}`}>
                <p className="text-sm text-[var(--color-text)] leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>
                {post.mediaUrls?.length > 0 && (
                  <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: post.mediaUrls.length > 1 ? '1fr 1fr' : '1fr' }}>
                    {post.mediaUrls.map((url: string, i: number) => (
                      <img key={i} src={url} alt="" className="rounded-lg w-full h-48 object-cover" />
                    ))}
                  </div>
                )}
              </Link>

              {/* Actions */}
              <div className="flex items-center gap-6 pt-3 border-t border-[var(--color-border)]">
                <button onClick={() => handleLike(post.id)} className={`flex items-center gap-1.5 text-sm transition-colors ${post.liked?.[0] || post.liked ? 'text-red-500' : 'text-[var(--color-muted)] hover:text-red-500'}`}>
                  <svg className="w-5 h-5" fill={post.liked?.[0] || post.liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {post._count.likes}
                </button>
                <Link to={`/social/post/${post.id}`} className="flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {post._count.comments}
                </Link>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm border border-[var(--color-border)] rounded-lg disabled:opacity-50">السابق</button>
              <span className="px-4 py-2 text-sm text-[var(--color-muted)]">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 text-sm border border-[var(--color-border)] rounded-lg disabled:opacity-50">التالي</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
