import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, photoUrl } from '../../lib/api';

export default function MyProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.profile.getMy()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-8">{t('common.loading')}</div>;

  if (!profile) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-[#1B4332] mb-4">{t('profile.create')}</h2>
        <p className="text-[#6B7280] mb-8">ليس لديك ملف شخصي بعد. قم بإنشاء ملفك الآن</p>
        <button
          onClick={() => navigate('/profile/setup')}
          className="px-8 py-3 bg-[#1B4332] text-white rounded-lg hover:bg-[#2D6A4F]"
        >
          {t('profile.create')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-[#E5E7EB]">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1B4332]">{profile.displayName}</h1>
            <p className="text-[#6B7280]">{profile.age} سنة • {profile.nationality}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            profile.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
            profile.status === 'PENDING_AI_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
            profile.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {t(`profile.status.${profile.status}`)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-[#6B7280]">{t('profile.city')}</p>
            <p className="font-medium">{profile.city}, {profile.countryOfResidence}</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">الوزن/الطول</p>
            <p className="font-medium">{profile.weight || '—'} كجم / {profile.height || '—'} سم</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">لون البشرة</p>
            <p className="font-medium">{profile.skinColor || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">اللحية</p>
            <p className="font-medium">{profile.beard || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">الرياضة</p>
            <p className="font-medium">{profile.sports || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">التدخين</p>
            <p className="font-medium">{profile.smoking || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">المؤهل</p>
            <p className="font-medium">{profile.education} {profile.educationLevel ? `- ${profile.educationLevel}` : ''}</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">المهنة</p>
            <p className="font-medium">{profile.occupation}{profile.workType ? ` (${profile.workType})` : ''}</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">مستوى الدخل</p>
            <p className="font-medium">{profile.incomeLevel || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">المذهب</p>
            <p className="font-medium">{t(`profile.madhab.${profile.madhab}`)}</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">محافظة المنشأ</p>
            <p className="font-medium">{profile.originGovernorate || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">محافظة الإقامة</p>
            <p className="font-medium">{profile.residenceGovernorate || '—'}</p>
          </div>
        </div>

        {(profile.photos?.length > 0) && (
          <div className="mb-6">
            <h3 className="font-semibold text-[#1B4332] mb-3">الصور</h3>
            <div className="grid grid-cols-3 gap-3">
              {profile.photos.map((photo: any) => (
                <div key={photo.id} className="aspect-square rounded-lg overflow-hidden border border-[#E5E7EB]">
                  <img src={photoUrl(photo.url)} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-semibold text-[#1B4332] mb-2">بيانات الأسرة</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-[#6B7280]">عمل الوالد:</span> {profile.fatherOccupation || '—'}</div>
            <div><span className="text-[#6B7280]">عمل الوالدة:</span> {profile.motherOccupation || '—'}</div>
            <div><span className="text-[#6B7280]">عدد الأخوة:</span> {profile.siblingsCount || '—'}</div>
            <div><span className="text-[#6B7280]">مؤهلاتهم:</span> {profile.siblingsEducation || '—'}</div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-[#1B4332] mb-2">بيانات السكن</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-[#6B7280]">المنطقة:</span> {profile.areaType || '—'}</div>
            <div><span className="text-[#6B7280]">سكن الزوجية:</span> {profile.marriedResidence || '—'}</div>
            <div><span className="text-[#6B7280]">نوع السكن:</span> {profile.housingType || '—'}</div>
            <div><span className="text-[#6B7280]">بيت عائلة/منفصل:</span> {profile.housingPrivacy || '—'}</div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-[#1B4332] mb-2">الحالة الاجتماعية</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-[#6B7280]">الحالة:</span> {profile.maritalStatus === 'SINGLE' ? 'أعزب' : profile.maritalStatus === 'DIVORCED' ? 'مطلق' : profile.maritalStatus === 'WIDOWED' ? 'أرمل' : profile.maritalStatus}</div>
            <div><span className="text-[#6B7280]">عدد الزيجات:</span> {profile.marriageNumber || '—'}</div>
            {profile.lastDivorceDate && <div><span className="text-[#6B7280]">آخر طلاق:</span> {profile.lastDivorceDate}</div>}
            <div><span className="text-[#6B7280]">أطفال:</span> {profile.hasChildren ? `${profile.numberOfChildren} (${profile.childrenDetails || ''})` : 'لا'}</div>
            {profile.childrenCustody && <div><span className="text-[#6B7280]">الحضانة:</span> {profile.childrenCustody}</div>}
            <div><span className="text-[#6B7280]">يرغب في التعدد:</span> {profile.wantsPolygamy ? 'نعم' : 'لا'}</div>
            <div><span className="text-[#6B7280]">يرغب في الإنجاب:</span> {profile.wantsChildren ? 'نعم' : 'لا'}</div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-[#1B4332] mb-2">{t('profile.selfIntroduction')}</h3>
          <p className="text-[#4A4A4A] leading-relaxed">{profile.selfIntroduction}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/profile/setup?edit=${profile.id}`)}
            className="px-6 py-2 border border-[#1B4332] text-[#1B4332] rounded-lg hover:bg-gray-50"
          >
            تعديل الملف
          </button>
          {profile.status === 'DRAFT' && (
            <button
              onClick={() => api.profile.submit(profile.id).then(() => window.location.reload())}
              className="px-6 py-2 bg-[#1B4332] text-white rounded-lg hover:bg-[#2D6A4F]"
            >
              {t('profile.submit')}
            </button>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
          <p className="text-sm text-[#6B7280]">
            المشاهدات: {profile.viewCount} • طلبات التواصل: {profile.requestCount}
          </p>
        </div>
      </div>
    </div>
  );
}
