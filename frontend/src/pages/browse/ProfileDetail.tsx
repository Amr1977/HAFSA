import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../lib/api';
import { photoUrl } from '../../lib/api';

export default function ProfileDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.browse.get(id)
      .then(setProfile)
      .catch(() => navigate('/browse'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const sendRequest = async () => {
    if (!id) return;
    setSending(true);
    try {
      await api.requests.send({ profileId: id, message });
      alert('تم إرسال طلب التواصل');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="text-center py-8">{t('common.loading')}</div>;
  if (!profile) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate('/browse')} className="text-[#6B7280] hover:text-[#1B4332] mb-4 block">
        ← {t('common.back')}
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        {profile.photos?.[0] && (
          <img src={photoUrl(profile.photos[0].url)} alt="" className="w-full h-64 object-cover" />
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#1B4332]">{profile.displayName}</h1>
              <p className="text-[#6B7280]">
                {profile.age} سنة • {profile.nationality}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div>
            <p className="text-sm text-[#6B7280]">{t('profile.city')}</p>
            <p className="font-medium">{profile.city}, {profile.countryOfResidence}</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">{t('profile.weight')} / {t('profile.height')}</p>
            <p className="font-medium">{profile.weight || '—'} / {profile.height || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">{t('profile.skinColor')}</p>
            <p className="font-medium">{profile.skinColor || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">{t('profile.beard')}</p>
            <p className="font-medium">{profile.beard || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">{t('profile.sports')}</p>
            <p className="font-medium">{profile.sports || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">{t('profile.smoking')}</p>
            <p className="font-medium">{profile.smoking || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">{t('profile.education')}</p>
            <p className="font-medium">{profile.education} {profile.educationLevel ? `- ${profile.educationLevel}` : ''}</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">{t('profile.occupation')}</p>
            <p className="font-medium">{profile.occupation}{profile.workType ? ` (${profile.workType})` : ''}</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">{t('profile.incomeLevel')}</p>
            <p className="font-medium">{profile.incomeLevel || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">{t('profile.madhab')}</p>
            <p className="font-medium">{t(`profile.madhab.${profile.madhab}`)}</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">{t('profile.originGovernorate')}</p>
            <p className="font-medium">{profile.originGovernorate || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-[#6B7280]">{t('profile.residenceGovernorate')}</p>
            <p className="font-medium">{profile.residenceGovernorate || '—'}</p>
          </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-[#1B4332] mb-2">{t('profile.sections.family')}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-[#6B7280]">{t('profile.fatherOccupation')}:</span> {profile.fatherOccupation || '—'}</div>
              <div><span className="text-[#6B7280]">{t('profile.motherOccupation')}:</span> {profile.motherOccupation || '—'}</div>
              <div><span className="text-[#6B7280]">{t('profile.siblingsCount')}:</span> {profile.siblingsCount || '—'}</div>
              <div><span className="text-[#6B7280]">{t('profile.siblingsEducation')}:</span> {profile.siblingsEducation || '—'}</div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-[#1B4332] mb-2">{t('profile.sections.residence')}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-[#6B7280]">{t('profile.areaType')}:</span> {profile.areaType || '—'}</div>
              <div><span className="text-[#6B7280]">{t('profile.marriedResidence')}:</span> {profile.marriedResidence || '—'}</div>
              <div><span className="text-[#6B7280]">{t('profile.housingType')}:</span> {profile.housingType || '—'}</div>
              <div><span className="text-[#6B7280]">{t('profile.housingPrivacy')}:</span> {profile.housingPrivacy || '—'}</div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-[#1B4332] mb-2">{t('profile.sections.maritalInfo')}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-[#6B7280]">{t('profile.sections.maritalStatus_label')}:</span> {profile.maritalStatus === 'SINGLE' ? t('profile.maritalStatus.SINGLE') : profile.maritalStatus === 'DIVORCED' ? t('profile.maritalStatus.DIVORCED') : profile.maritalStatus === 'WIDOWED' ? t('profile.maritalStatus.WIDOWED') : profile.maritalStatus}</div>
              <div><span className="text-[#6B7280]">{t('profile.marriageNumber')}:</span> {profile.marriageNumber || '—'}</div>
              {profile.lastDivorceDate && <div><span className="text-[#6B7280]">{t('profile.lastDivorceDate')}:</span> {profile.lastDivorceDate}</div>}
              <div><span className="text-[#6B7280]">{t('profile.hasChildren')}:</span> {profile.hasChildren ? `${profile.numberOfChildren} (${profile.childrenDetails || ''})` : t('common.no')}</div>
              {profile.childrenCustody && <div><span className="text-[#6B7280]">{t('profile.childrenCustody')}:</span> {profile.childrenCustody}</div>}
              <div><span className="text-[#6B7280]">{t('profile.wantsPolygamy')}:</span> {profile.wantsPolygamy ? t('common.yes') : t('common.no')}</div>
              <div><span className="text-[#6B7280]">{t('profile.wantsChildren')}:</span> {profile.wantsChildren ? t('common.yes') : t('common.no')}</div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-[#1B4332] mb-2">التعريف الذاتي</h3>
            <p className="text-[#4A4A4A] leading-relaxed">{profile.selfIntroduction}</p>
          </div>

          <div className="border-t border-[#E5E7EB] pt-6">
            <h3 className="font-semibold text-[#1B4332] mb-4">إرسال طلب تواصل</h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg h-24 mb-3"
              placeholder="اكتب رسالة تعريفية..."
            />
            <button
              onClick={sendRequest}
              disabled={sending}
              className="px-6 py-2 bg-[#1B4332] text-white rounded-lg hover:bg-[#2D6A4F] disabled:opacity-50"
            >
              {sending ? t('common.loading') : t('browse.sendRequest')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
