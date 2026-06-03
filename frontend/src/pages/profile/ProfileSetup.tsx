import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { photoUrl } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

const STEPS = ['basic', 'marital', 'islamic', 'intro', 'requirements', 'photos', 'review'];

const EMPTY_FORM = {
  displayName: '',
  age: 25,
  nationality: '',
  countryOfResidence: '',
  city: '',
  education: '',
  occupation: '',
  maritalStatus: 'SINGLE',
  marriageNumber: 'FIRST',
  hasChildren: false,
  numberOfChildren: 0,
  madhab: 'HANAFI',
  prayerCommitment: 'ALWAYS',
  quranMemorization: 'SOME_SURAHS',
  religiousDescription: '',
  selfIntroduction: '',
  wifeAgeMin: 18,
  wifeAgeMax: 35,
  wifeNationality: '',
  wifeCountry: '',
  wifeEducation: '',
  wifeMaritalStatus: 'any',
  wifeHasChildren: 'no_preference',
  wifeReligiousLevel: '',
  photos: [],
};

export default function ProfileSetup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useAuthStore();
  const editId = searchParams.get('edit');
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<any>({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!editId);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editId) return;
    api.profile.getMy().then((p: any) => {
      setForm({
        displayName: p.displayName || '',
        age: p.age || 25,
        nationality: p.nationality || '',
        countryOfResidence: p.countryOfResidence || '',
        city: p.city || '',
        education: p.education || '',
        occupation: p.occupation || '',
        maritalStatus: p.maritalStatus || 'SINGLE',
        marriageNumber: p.marriageNumber || 'FIRST',
        hasChildren: p.hasChildren || false,
        numberOfChildren: p.numberOfChildren || 0,
        madhab: p.madhab || 'HANAFI',
        prayerCommitment: p.prayerCommitment || 'ALWAYS',
        quranMemorization: p.quranMemorization || 'SOME_SURAHS',
        religiousDescription: p.religiousDescription || '',
        selfIntroduction: p.selfIntroduction || '',
        wifeAgeMin: p.wifeAgeMin || 18,
        wifeAgeMax: p.wifeAgeMax || 35,
        wifeNationality: p.wifeNationality || '',
        wifeCountry: p.wifeCountry || '',
        wifeEducation: p.wifeEducation || '',
        wifeMaritalStatus: p.wifeMaritalStatus || 'any',
        wifeHasChildren: p.wifeHasChildren || 'no_preference',
        wifeReligiousLevel: p.wifeReligiousLevel || '',
        photos: (p.photos || []).map((ph: any) => photoUrl(ph.url)),
      });
    }).catch(() => {}).finally(() => setInitialLoading(false));
  }, [editId]);

  const update = (field: string, value: any) => setForm({ ...form, [field]: value });

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const API_BASE = import.meta.env.VITE_API_URL || '/api';
      const token = localStorage.getItem('auth_token');

      let profile;
      if (editId) {
        const { photos: formPhotos, ...data } = form;
        profile = await api.profile.update(editId, data);
        for (const photo of formPhotos) {
          if (photo.startsWith('data:')) {
            const blob = await fetch(photo).then(r => r.blob());
            const fd = new FormData();
            fd.append('photo', blob, 'photo.jpg');
            await fetch(`${API_BASE}/profiles/${profile.id}/photos`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: fd,
            });
          }
        }
      } else {
        profile = await api.profile.create(form);
        for (const photo of form.photos) {
          if (photo.startsWith('data:')) {
            const blob = await fetch(photo).then(r => r.blob());
            const fd = new FormData();
            fd.append('photo', blob, 'photo.jpg');
            await fetch(`${API_BASE}/profiles/${profile.id}/photos`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: fd,
            });
          }
        }
        await api.profile.submit(profile.id);
      }
      const user = await api.auth.getMe();
      setUser(user);
      navigate('/profile/my');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (STEPS[step]) {
      case 'basic':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#1B4332]">{t('profile.basicInfo')}</h2>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">{t('profile.displayName')}</label>
              <input type="text" value={form.displayName} onChange={(e) => update('displayName', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1B4332]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">{t('profile.age')}</label>
              <input type="number" value={form.age} onChange={(e) => update('age', parseInt(e.target.value))} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1B4332]" min={18} max={100} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">{t('profile.nationality')}</label>
              <input type="text" value={form.nationality} onChange={(e) => update('nationality', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1B4332]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">{t('profile.country')}</label>
              <input type="text" value={form.countryOfResidence} onChange={(e) => update('countryOfResidence', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1B4332]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">{t('profile.city')}</label>
              <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1B4332]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">{t('profile.education')}</label>
              <input type="text" value={form.education} onChange={(e) => update('education', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1B4332]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">{t('profile.occupation')}</label>
              <input type="text" value={form.occupation} onChange={(e) => update('occupation', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1B4332]" required />
            </div>
          </div>
        );

      case 'marital':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#1B4332]">الحالة الاجتماعية</h2>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">{t('profile.maritalStatus')}</label>
              <select value={form.maritalStatus} onChange={(e) => update('maritalStatus', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg bg-white">
                {Object.entries(t('profile.maritalStatus', { returnObjects: true }) as Record<string, string>).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">{t('profile.marriageNumber')}</label>
              <select value={form.marriageNumber} onChange={(e) => update('marriageNumber', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg bg-white">
                {Object.entries(t('profile.marriageNumber', { returnObjects: true }) as Record<string, string>).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.hasChildren} onChange={(e) => update('hasChildren', e.target.checked)} className="rounded" />
                <span className="text-sm">{t('profile.hasChildren')}</span>
              </label>
            </div>
            {form.hasChildren && (
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">{t('profile.numberOfChildren')}</label>
                <input type="number" value={form.numberOfChildren} onChange={(e) => update('numberOfChildren', parseInt(e.target.value))} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" min={0} />
              </div>
            )}
          </div>
        );

      case 'islamic':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#1B4332]">الملف الإسلامي</h2>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">{t('profile.madhab')}</label>
              <select value={form.madhab} onChange={(e) => update('madhab', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg bg-white">
                {Object.entries(t('profile.madhab', { returnObjects: true }) as Record<string, string>).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">{t('profile.prayer')}</label>
              <select value={form.prayerCommitment} onChange={(e) => update('prayerCommitment', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg bg-white">
                {Object.entries(t('profile.prayer', { returnObjects: true }) as Record<string, string>).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">{t('profile.quran')}</label>
              <select value={form.quranMemorization} onChange={(e) => update('quranMemorization', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg bg-white">
                {Object.entries(t('profile.quran', { returnObjects: true }) as Record<string, string>).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">وصف الالتزام الديني</label>
              <textarea value={form.religiousDescription} onChange={(e) => update('religiousDescription', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg h-24" />
            </div>
          </div>
        );

      case 'intro':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#1B4332]">{t('profile.selfIntroduction')}</h2>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">التعريف الذاتي</label>
              <textarea value={form.selfIntroduction} onChange={(e) => update('selfIntroduction', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg h-40" required minLength={100} />
              <p className="text-xs text-[#6B7280] mt-1">الحد الأدنى 100 حرف</p>
            </div>
          </div>
        );

      case 'requirements':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#1B4332]">{t('profile.wifeRequirements')}</h2>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#6B7280] mb-1">السن من</label>
                <input type="number" value={form.wifeAgeMin} onChange={(e) => update('wifeAgeMin', parseInt(e.target.value))} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" min={18} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#6B7280] mb-1">السن إلى</label>
                <input type="number" value={form.wifeAgeMax} onChange={(e) => update('wifeAgeMax', parseInt(e.target.value))} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" min={18} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">{t('profile.wifeNationality')}</label>
              <input type="text" value={form.wifeNationality} onChange={(e) => update('wifeNationality', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" placeholder="اترك فارغاً للجميع" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">{t('profile.wifeEducation')}</label>
              <input type="text" value={form.wifeEducation} onChange={(e) => update('wifeEducation', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">{t('profile.wifeMaritalStatus')}</label>
              <select value={form.wifeMaritalStatus} onChange={(e) => update('wifeMaritalStatus', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg bg-white">
                <option value="any">لا فرق</option>
                <option value="virgin">بكر</option>
                <option value="divorced">مطلقة</option>
                <option value="widowed">أرملة</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">{t('profile.wifeReligiousLevel')}</label>
              <input type="text" value={form.wifeReligiousLevel} onChange={(e) => update('wifeReligiousLevel', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" />
            </div>
          </div>
        );

      case 'photos':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#1B4332]">إضافة الصور</h2>
            <p className="text-sm text-[#6B7280]">أضف صوراً لملفك الشخصي (اختياري - حد أقصى 6)</p>
            <div className="grid grid-cols-3 gap-4">
              {form.photos.map((photo: string, i: number) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[#E5E7EB]">
                  <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => {
                      const updated = form.photos.filter((_: any, j: number) => j !== i);
                      update('photos', updated);
                    }}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
              {form.photos.length < 6 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-[#E5E7EB] flex items-center justify-center cursor-pointer hover:border-[#1B4332] transition-colors">
                  <span className="text-3xl text-[#6B7280]">+</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          update('photos', [...form.photos, ev.target?.result]);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-[#6B7280]">{form.photos.length} / 6 صور</p>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#1B4332]">مراجعة الملف الشخصي</h2>
            <div className="bg-[#D8F3DC] p-4 rounded-lg">
              <p className="text-sm text-[#1B4332]">
                سيتم مراجعة ملفك الشخصي آلياً بواسطة الذكاء الاصطناعي قبل النشر
              </p>
            </div>
            <div className="space-y-2">
              <p><strong>الاسم:</strong> {form.displayName}</p>
              <p><strong>العمر:</strong> {form.age}</p>
              <p><strong>الجنسية:</strong> {form.nationality}</p>
              <p><strong>البلد:</strong> {form.countryOfResidence}</p>
              <p><strong>المدينة:</strong> {form.city}</p>
              <p><strong>المهنة:</strong> {form.occupation}</p>
              <p><strong>المذهب:</strong> {form.madhab}</p>
            </div>
          </div>
        );

      default:
        return <div>Form step {STEPS[step]}</div>;
    }
  };

  if (initialLoading) return <div className="text-center py-8">{t('common.loading')}</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-[#E5E7EB]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-[#1B4332]">
            {editId ? 'تعديل الملف الشخصي' : 'إنشاء الملف الشخصي'}
          </h1>
          {editId && (
            <button onClick={() => navigate('/profile/my')} className="text-sm text-[#6B7280] hover:text-[#1B4332]">
              العودة إلى الملف
            </button>
          )}
        </div>
        {/* Progress bar */}
        <div className="flex gap-1 mb-8">
          {STEPS.map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full ${i <= step ? 'bg-[#1B4332]' : 'bg-[#E5E7EB]'}`} />
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        {renderStep()}

        <div className="flex justify-between mt-8">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-gray-50"
            >
              {t('common.previous')}
            </button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 bg-[#1B4332] text-white rounded-lg hover:bg-[#2D6A4F]"
            >
              {t('common.next')}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-[#1B4332] text-white rounded-lg hover:bg-[#2D6A4F] disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('profile.submit')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
