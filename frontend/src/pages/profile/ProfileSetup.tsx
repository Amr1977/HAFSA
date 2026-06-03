import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { photoUrl } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

const STEPS = ['basic', 'personal', 'marital', 'family', 'islamic', 'requirements', 'photos', 'review'];

const EMPTY_FORM = {
  displayName: '',
  age: 25,
  dateOfBirth: '',
  weight: 0,
  height: 0,
  skinColor: '',
  beard: '',
  sports: '',
  healthIssues: '',
  nationality: '',
  countryOfResidence: '',
  city: '',
  education: '',
  educationLevel: '',
  occupation: '',
  workType: '',
  incomeLevel: '',
  maritalStatus: 'SINGLE',
  marriageNumber: 'FIRST',
  lastDivorceDate: '',
  hasChildren: false,
  numberOfChildren: 0,
  childrenDetails: '',
  childrenCustody: '',
  wantsPolygamy: false,
  wantsChildren: true,
  fatherOccupation: '',
  motherOccupation: '',
  siblingsCount: 0,
  siblingsEducation: '',
  originGovernorate: '',
  residenceGovernorate: '',
  areaType: '',
  marriedResidence: '',
  housingType: '',
  housingPrivacy: '',
  madhab: 'HANAFI',
  prayerCommitment: 'ALWAYS',
  quranMemorization: 'SOME_SURAHS',
  religiousDescription: '',
  smoking: '',
  selfIntroduction: '',
  additionalNotes: '',
  wifeAgeMin: 18,
  wifeAgeMax: 35,
  wifeNationality: '',
  wifeCountry: '',
  wifeEducation: '',
  wifeMaritalStatus: 'any',
  wifeHasChildren: 'no_preference',
  wifeReligiousLevel: '',
  wifePreferredSkinColor: '',
  wifePreferredHijab: '',
  wifePreferredWork: '',
  wifeAcceptDivorcedWithChildren: '',
  wifeAcceptDivorcedChildrenCustody: '',
  wifeAcceptOtherCity: false,
  wifeFurnishApartment: '',
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
        dateOfBirth: p.dateOfBirth || '',
        weight: p.weight || 0,
        height: p.height || 0,
        skinColor: p.skinColor || '',
        beard: p.beard || '',
        sports: p.sports || '',
        healthIssues: p.healthIssues || '',
        nationality: p.nationality || '',
        countryOfResidence: p.countryOfResidence || '',
        city: p.city || '',
        education: p.education || '',
        educationLevel: p.educationLevel || '',
        occupation: p.occupation || '',
        workType: p.workType || '',
        incomeLevel: p.incomeLevel || '',
        maritalStatus: p.maritalStatus || 'SINGLE',
        marriageNumber: p.marriageNumber || 'FIRST',
        lastDivorceDate: p.lastDivorceDate || '',
        hasChildren: p.hasChildren || false,
        numberOfChildren: p.numberOfChildren || 0,
        childrenDetails: p.childrenDetails || '',
        childrenCustody: p.childrenCustody || '',
        wantsPolygamy: p.wantsPolygamy || false,
        wantsChildren: p.wantsChildren ?? true,
        fatherOccupation: p.fatherOccupation || '',
        motherOccupation: p.motherOccupation || '',
        siblingsCount: p.siblingsCount || 0,
        siblingsEducation: p.siblingsEducation || '',
        originGovernorate: p.originGovernorate || '',
        residenceGovernorate: p.residenceGovernorate || '',
        areaType: p.areaType || '',
        marriedResidence: p.marriedResidence || '',
        housingType: p.housingType || '',
        housingPrivacy: p.housingPrivacy || '',
        madhab: p.madhab || 'HANAFI',
        prayerCommitment: p.prayerCommitment || 'ALWAYS',
        quranMemorization: p.quranMemorization || 'SOME_SURAHS',
        religiousDescription: p.religiousDescription || '',
        smoking: p.smoking || '',
        selfIntroduction: p.selfIntroduction || '',
        additionalNotes: p.additionalNotes || '',
        wifeAgeMin: p.wifeAgeMin || 18,
        wifeAgeMax: p.wifeAgeMax || 35,
        wifeNationality: p.wifeNationality || '',
        wifeCountry: p.wifeCountry || '',
        wifeEducation: p.wifeEducation || '',
        wifeMaritalStatus: p.wifeMaritalStatus || 'any',
        wifeHasChildren: p.wifeHasChildren || 'no_preference',
        wifeReligiousLevel: p.wifeReligiousLevel || '',
        wifePreferredSkinColor: p.wifePreferredSkinColor || '',
        wifePreferredHijab: p.wifePreferredHijab || '',
        wifePreferredWork: p.wifePreferredWork || '',
        wifeAcceptDivorcedWithChildren: p.wifeAcceptDivorcedWithChildren || '',
        wifeAcceptDivorcedChildrenCustody: p.wifeAcceptDivorcedChildrenCustody || '',
        wifeAcceptOtherCity: p.wifeAcceptOtherCity || false,
        wifeFurnishApartment: p.wifeFurnishApartment || '',
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
            <h2 className="text-xl font-semibold text-[#1B4332]">المعلومات الأساسية</h2>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">{t('profile.displayName')}</label>
              <input type="text" value={form.displayName} onChange={(e) => update('displayName', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1B4332]" required />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#6B7280] mb-1">السن</label>
                <input type="number" value={form.age} onChange={(e) => update('age', parseInt(e.target.value))} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" min={18} max={100} required />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#6B7280] mb-1">تاريخ الميلاد</label>
                <input type="date" value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">الجنسية</label>
              <input type="text" value={form.nationality} onChange={(e) => update('nationality', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">بلد الإقامة</label>
              <input type="text" value={form.countryOfResidence} onChange={(e) => update('countryOfResidence', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">المدينة</label>
              <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" required />
            </div>
          </div>
        );

      case 'personal':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#1B4332]">المواصفات الشخصية</h2>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#6B7280] mb-1">الوزن (كجم)</label>
                <input type="number" value={form.weight} onChange={(e) => update('weight', parseInt(e.target.value))} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-[#6B7280] mb-1">الطول (سم)</label>
                <input type="number" value={form.height} onChange={(e) => update('height', parseInt(e.target.value))} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">لون البشرة</label>
              <input type="text" value={form.skinColor} onChange={(e) => update('skinColor', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" placeholder="مثال: أبيض، خمري， آدم..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">اللحية</label>
              <input type="text" value={form.beard} onChange={(e) => update('beard', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" placeholder="مثال: بدون， خفيفة， كثة..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">الرياضة</label>
              <input type="text" value={form.sports} onChange={(e) => update('sports', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">هل تعاني من أي أمراض أو إعاقات؟</label>
              <input type="text" value={form.healthIssues} onChange={(e) => update('healthIssues', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" placeholder="لا الحمد لله" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">التدخين</label>
              <input type="text" value={form.smoking} onChange={(e) => update('smoking', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" placeholder="لا أدخن" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">المؤهل الدراسي</label>
              <input type="text" value={form.education} onChange={(e) => update('education', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" placeholder="مثال: كلية، جامعة، متوسط..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">اسم المؤهل</label>
              <input type="text" value={form.educationLevel} onChange={(e) => update('educationLevel', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" placeholder="مثال: بكالريوس تجارة" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">العمل الفعلي</label>
              <input type="text" value={form.occupation} onChange={(e) => update('occupation', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">نوع العمل</label>
              <input type="text" value={form.workType} onChange={(e) => update('workType', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" placeholder="خاص / عام / حر" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">مستوى الدخل</label>
              <input type="text" value={form.incomeLevel} onChange={(e) => update('incomeLevel', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" />
            </div>
          </div>
        );

      case 'marital':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#1B4332]">الحالة الاجتماعية</h2>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">الحالة الاجتماعية</label>
              <select value={form.maritalStatus} onChange={(e) => update('maritalStatus', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg bg-white">
                {Object.entries(t('profile.maritalStatus', { returnObjects: true }) as Record<string, string>).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">عدد مرات الزواج</label>
              <select value={form.marriageNumber} onChange={(e) => update('marriageNumber', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg bg-white">
                {Object.entries(t('profile.marriageNumber', { returnObjects: true }) as Record<string, string>).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            {(form.maritalStatus === 'DIVORCED' || form.maritalStatus === 'WIDOWED') && (
              <div>
                <label className="block text-sm font-medium text-[#6B7280] mb-1">تاريخ آخر طلاق</label>
                <input type="text" value={form.lastDivorceDate} onChange={(e) => update('lastDivorceDate', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" placeholder="منذ عام" />
              </div>
            )}
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.hasChildren} onChange={(e) => update('hasChildren', e.target.checked)} className="rounded" />
                <span className="text-sm">هل لديه أطفال؟</span>
              </label>
            </div>
            {form.hasChildren && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">عدد الأطفال</label>
                  <input type="number" value={form.numberOfChildren} onChange={(e) => update('numberOfChildren', parseInt(e.target.value))} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" min={0} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">تفاصيل الأبناء (الأعمار، الجنس)</label>
                  <textarea value={form.childrenDetails} onChange={(e) => update('childrenDetails', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg h-20" placeholder="ولد وبنت عندها ٦ سنين والولد 5 سنين" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6B7280] mb-1">حضانة الأبناء بعد الزواج</label>
                  <input type="text" value={form.childrenCustody} onChange={(e) => update('childrenCustody', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" placeholder="مع الأم" />
                </div>
              </>
            )}
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.wantsPolygamy} onChange={(e) => update('wantsPolygamy', e.target.checked)} className="rounded" />
                <span className="text-sm">هل ترغب في التعدد؟</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.wantsChildren} onChange={(e) => update('wantsChildren', e.target.checked)} className="rounded" />
                <span className="text-sm">هل لديك رغبة في الإنجاب؟</span>
              </label>
            </div>
          </div>
        );

      case 'family':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#1B4332]">بيانات الأسرة والسكن</h2>
            <h3 className="font-medium text-[#1B4332] text-sm mt-2">بيانات الأسرة</h3>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">عمل الوالد</label>
              <input type="text" value={form.fatherOccupation} onChange={(e) => update('fatherOccupation', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" placeholder="متوفي / موظف / ..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">عمل الوالدة</label>
              <input type="text" value={form.motherOccupation} onChange={(e) => update('motherOccupation', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" placeholder="ربة منزل" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">عدد الأخوة والأخوات</label>
              <input type="number" value={form.siblingsCount} onChange={(e) => update('siblingsCount', parseInt(e.target.value))} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" min={0} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">مؤهلاتهم</label>
              <input type="text" value={form.siblingsEducation} onChange={(e) => update('siblingsEducation', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" placeholder="عليا ومتوسط" />
            </div>

            <hr className="border-[#E5E7EB]" />
            <h3 className="font-medium text-[#1B4332] text-sm">بيانات السكن</h3>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">محافظة المنشأ</label>
              <input type="text" value={form.originGovernorate} onChange={(e) => update('originGovernorate', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">محافظة الإقامة</label>
              <input type="text" value={form.residenceGovernorate} onChange={(e) => update('residenceGovernorate', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">المنطقة</label>
              <input type="text" value={form.areaType} onChange={(e) => update('areaType', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" placeholder="متوسطة / راقية / ..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">أين سكن الزوجية؟</label>
              <input type="text" value={form.marriedResidence} onChange={(e) => update('marriedResidence', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" placeholder="السعودية والدقهلية" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">نوع السكن</label>
              <input type="text" value={form.housingType} onChange={(e) => update('housingType', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" placeholder="إيجار / ملك" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">بيت عائلة أم منفصل؟</label>
              <input type="text" value={form.housingPrivacy} onChange={(e) => update('housingPrivacy', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" />
            </div>
          </div>
        );

      case 'islamic':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#1B4332]">الملف الإسلامي</h2>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">المذهب</label>
              <select value={form.madhab} onChange={(e) => update('madhab', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg bg-white">
                {Object.entries(t('profile.madhab', { returnObjects: true }) as Record<string, string>).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">الالتزام بالصلاة</label>
              <select value={form.prayerCommitment} onChange={(e) => update('prayerCommitment', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg bg-white">
                {Object.entries(t('profile.prayer', { returnObjects: true }) as Record<string, string>).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">حفظ القرآن</label>
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
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">التعريف الذاتي</label>
              <textarea value={form.selfIntroduction} onChange={(e) => update('selfIntroduction', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg h-32" minLength={100} />
              <p className="text-xs text-[#6B7280] mt-1">الحد الأدنى 100 حرف</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">إضافات وملاحظات</label>
              <textarea value={form.additionalNotes} onChange={(e) => update('additionalNotes', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg h-24" />
            </div>
          </div>
        );

      case 'requirements':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#1B4332]">مواصفات شريكة الحياة</h2>
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
              <label className="block text-sm font-medium text-[#6B7280] mb-1">الجنسية</label>
              <input type="text" value={form.wifeNationality} onChange={(e) => update('wifeNationality', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" placeholder="اترك فارغاً للجميع" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">بلد الإقامة</label>
              <input type="text" value={form.wifeCountry} onChange={(e) => update('wifeCountry', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" placeholder="اترك فارغاً للجميع" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">لون البشرة المفضل</label>
              <input type="text" value={form.wifePreferredSkinColor} onChange={(e) => update('wifePreferredSkinColor', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" placeholder="بيضاء / خمرية / ..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">الحجاب</label>
              <input type="text" value={form.wifePreferredHijab} onChange={(e) => update('wifePreferredHijab', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" placeholder="خمار / نقاب / لبس محتشم" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">المستوى التعليمي</label>
              <input type="text" value={form.wifeEducation} onChange={(e) => update('wifeEducation', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">العمل</label>
              <input type="text" value={form.wifePreferredWork} onChange={(e) => update('wifePreferredWork', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" placeholder="لا تعمل / أي عمل / ..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">الحالة الاجتماعية</label>
              <select value={form.wifeMaritalStatus} onChange={(e) => update('wifeMaritalStatus', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg bg-white">
                <option value="any">لا فرق</option>
                <option value="virgin">بكر</option>
                <option value="divorced">مطلقة</option>
                <option value="widowed">أرملة</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">هل تقبل بمطلقة أو أرملة معها أطفال؟</label>
              <input type="text" value={form.wifeAcceptDivorcedWithChildren} onChange={(e) => update('wifeAcceptDivorcedWithChildren', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" placeholder="لا. رزقها الله أفضل مني" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">هل تقبل بمطلقة أطفالها في حضانة والدهم؟</label>
              <input type="text" value={form.wifeAcceptDivorcedChildrenCustody} onChange={(e) => update('wifeAcceptDivorcedChildrenCustody', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.wifeAcceptOtherCity} onChange={(e) => update('wifeAcceptOtherCity', e.target.checked)} className="rounded" />
                <span className="text-sm">هل تقبل الزواج من محافظة أخرى؟</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">المستوى الديني المطلوب</label>
              <input type="text" value={form.wifeReligiousLevel} onChange={(e) => update('wifeReligiousLevel', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">تجهيز الشقة والمهر</label>
              <input type="text" value={form.wifeFurnishApartment} onChange={(e) => update('wifeFurnishApartment', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg" placeholder="نعم عادي / لا / ..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-1">المواصفات العامة المطلوبة</label>
              <textarea value={form.wifeAdditionalNotes} onChange={(e) => update('wifeAdditionalNotes', e.target.value)} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg h-24" placeholder="أبحث عن إنسانة تفهمني وافهمها..." />
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
            <div className="space-y-2 text-sm">
              <p><strong className="text-[#6B7280]">الاسم:</strong> {form.displayName}</p>
              <p><strong className="text-[#6B7280]">السن:</strong> {form.age}</p>
              <p><strong className="text-[#6B7280]">الجنسية:</strong> {form.nationality}</p>
              <p><strong className="text-[#6B7280]">البلد:</strong> {form.countryOfResidence}</p>
              <p><strong className="text-[#6B7280]">المدينة:</strong> {form.city}</p>
              <p><strong className="text-[#6B7280]">المؤهل:</strong> {form.education} - {form.educationLevel}</p>
              <p><strong className="text-[#6B7280]">العمل:</strong> {form.occupation} ({form.workType})</p>
              <p><strong className="text-[#6B7280]">الوزن/الطول:</strong> {form.weight} كجم / {form.height} سم</p>
              <p><strong className="text-[#6B7280]">الحالة الاجتماعية:</strong> {form.maritalStatus === 'SINGLE' ? 'أعزب' : form.maritalStatus === 'DIVORCED' ? 'مطلق' : form.maritalStatus === 'WIDOWED' ? 'أرمل' : form.maritalStatus}</p>
              <p><strong className="text-[#6B7280]">المذهب:</strong> {form.madhab}</p>
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
