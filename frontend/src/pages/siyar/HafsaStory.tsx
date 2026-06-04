import { Link } from 'react-router-dom';

function GeometricBand() {
  return (
    <div
      className="h-[14px]"
      style={{
        background: 'repeating-linear-gradient(90deg, #1B4332 0px, #1B4332 20px, #DAA520 20px, #DAA520 22px, #1B4332 22px, #1B4332 42px, #B8860B 42px, #B8860B 44px)'
      }}
    />
  );
}

function SectionIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-11 h-11 bg-[#1B4332] dark:bg-[#DAA520] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
      <div className="[&>svg]:fill-[#DAA520] dark:[&>svg]:fill-[#1B4332]">
        {children}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-['Scheherazade_New'] text-[clamp(20px,3vw,26px)] font-bold text-[#1B4332] dark:text-[#DAA520] border-b-2 border-[#DAA520] pb-1 flex-1">
      {children}
    </h2>
  );
}

function NarrativeCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-[#D4C4A0] dark:border-gray-600 border-r-4 border-r-[#1B4332] dark:border-r-[#DAA520] rounded-lg p-5 md:p-6 mb-4 leading-[2.1] text-[clamp(16px,2vw,19px)] text-[#3D2B1F] dark:text-gray-200 shadow-md">
      {children}
    </div>
  );
}

function HadithBox({ children, source }: { children: React.ReactNode; source: string }) {
  return (
    <div className="bg-[#E8F5E9] dark:bg-gray-800 border border-[#A8D5B5] dark:border-gray-600 border-r-4 border-r-[#1B4332] dark:border-r-[#DAA520] rounded-lg p-5 md:p-6 my-6 shadow-md">
      <p className="font-['Scheherazade_New'] text-[clamp(17px,2.5vw,21px)] leading-[2.3] text-[#1B4332] dark:text-[#DAA520] italic">
        {'«'}{children}{'»'}
      </p>
      <div className="text-xs md:text-sm text-[#5D8C6F] dark:text-[#94a3b8] mt-3 text-left border-t border-dashed border-[#C8E6D0] dark:border-gray-600 pt-2 ltr">
        {source}
      </div>
    </div>
  );
}

function DateBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-[#F5E6B8] dark:bg-[#3D2B1F] text-[#B8860B] dark:text-[#F5E6B8] border border-[#DAA520] dark:border-[#B8860B] rounded-full px-4 py-0.5 text-sm font-semibold align-middle">
      {children}
    </span>
  );
}

const sectionStyles = `
  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .timeline {
    position: relative;
    padding-right: 2.5rem;
    margin: 1rem 0;
  }
  .timeline::before {
    content: '';
    position: absolute;
    right: 10px;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background: linear-gradient(to bottom, #DAA520, #1B4332);
  }
  .timeline-item {
    position: relative;
    margin-bottom: 1.4rem;
  }
  .timeline-item::before {
    content: '';
    position: absolute;
    right: -1.8rem;
    top: 20px;
    width: 16px;
    height: 16px;
    background: #DAA520;
    border-radius: 50%;
    border: 3px solid #FDF8EE;
    box-shadow: 0 0 0 2px #DAA520;
  }
  .dark .timeline::before {
    background: linear-gradient(to bottom, #DAA520, #1f2937);
  }
  .dark .timeline-item::before {
    background: #DAA520;
    border-color: #1f2937;
    box-shadow: 0 0 0 2px #DAA520;
  }
`;

export default function HafsaStory() {
  return (
    <div dir="rtl" className="bg-[#FDF8EE] dark:bg-gray-900 text-[#1A1008] dark:text-gray-100 min-h-screen font-['Scheherazade_New']">
      <style>{sectionStyles}</style>

      <GeometricBand />

      {/* ─── HERO ─── */}
      <header
        className="relative text-center py-16 md:py-20 px-4 overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0D2B1D 0%, #1B4332 40%, #2D6A4F 70%, #1B4332 100%)'
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23DAA520' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 15% 50%, rgba(218,165,32,0.12) 0%, transparent 55%), radial-gradient(ellipse at 85% 50%, rgba(218,165,32,0.12) 0%, transparent 55%), radial-gradient(ellipse at 50% 100%, rgba(27,67,50,0.6) 0%, transparent 70%)'
          }}
        />
        <div className="relative z-10">
          <div className="text-[32px] tracking-[12px] text-[#DAA520] mb-5 animate-[fadeDown_0.8s_ease_both]">
            ✦ ❖ ✦
          </div>
          <h1 className="text-[clamp(32px,6vw,52px)] font-bold text-[#F5E6B8] leading-[1.5] animate-[fadeDown_0.9s_ease_both]">
            زواج حفصة بنت عمر<br />من رسول الله ﷺ
          </h1>
          <div className="flex items-center justify-center gap-4 my-5 w-4/5 max-w-[500px] mx-auto animate-[fadeIn_1.1s_ease_both]">
            <div className="flex-1 h-px" style={{background: 'linear-gradient(90deg, transparent, #DAA520, transparent)'}} />
            <span className="text-[#DAA520] text-[22px]">◆</span>
            <div className="flex-1 h-px" style={{background: 'linear-gradient(90deg, transparent, #DAA520, transparent)'}} />
          </div>
          <p className="text-[#B8DFC8] text-lg italic animate-[fadeDown_1s_ease_both]">
            رواية مستقاة من أمهات المصادر الإسلامية الموثوقة
          </p>
        </div>
      </header>

      <GeometricBand />

      {/* ─── BREADCRUMB ─── */}
      <nav className="bg-[#1B4332] dark:bg-gray-950 px-8 py-2.5 flex gap-2 items-center text-sm text-[#9DC4AE]">
        <Link to="/" className="text-[#DAA520] no-underline hover:underline">الرئيسية</Link>
        <span>›</span>
            <span className="text-[#6B9A7A] dark:text-[#94a3b8]">حفصة بنت عمر رضي الله عنها</span>
      </nav>

      {/* ─── MAIN ─── */}
      <main className="max-w-[900px] mx-auto px-4 md:px-6 py-8 md:py-12">

        {/* ─── BREADCRUMB BACK LINK ─── */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#DAA520] bg-[rgba(218,165,32,0.1)] border border-[rgba(218,165,32,0.3)] rounded-full px-4 py-1.5 text-sm mb-6 no-underline hover:bg-[rgba(218,165,32,0.2)]"
        >
          ← العودة للرئيسية
        </Link>

        {/* ─── BISMILLAH ─── */}
        <div className="text-center py-6 px-4 bg-[#E8F5E9] dark:bg-gray-800 border-t-[3px] border-b-[3px] border-[#B8860B] my-8 rounded-sm">
          <div className="font-['Scheherazade_New'] text-[clamp(24px,4vw,36px)] font-bold text-[#1B4332] dark:text-[#DAA520] leading-[1.8]">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </div>
        </div>

        {/* ─── SECTION C: نسبها ─── */}
        <section className="my-10">
          <div className="flex items-center gap-3 mb-5">
            <SectionIcon>
              <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-[#DAA520]">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            </SectionIcon>
            <SectionTitle>نسبها وكنيتها رضي الله عنها</SectionTitle>
          </div>
          <NarrativeCard>
            <p>
              هي <span className="text-[#1B4332] dark:text-[#DAA520] font-bold">حفصة بنت عمر بن الخطاب</span> رضي الله عنهما، أمها <span className="text-[#1B4332] dark:text-[#DAA520] font-bold">زينب بنت مظعون</span> الجمحية، أخت عثمان بن مظعون. وُلدت قبل البعثة النبوية بخمس سنين، وذلك في مكة المكرمة في بيت الإيمان والعدل.
            </p>
            <p>
              كانت حفصة من المهاجرات الأوائل إلى المدينة المنورة، وكانت قارئةً كاتبةً في وقتٍ ندرت فيه الكتابة بين النساء، مما يدل على رفعة شأنها وعلو همتها رضي الله عنها.
            </p>
          </NarrativeCard>
        </section>

        {/* ─── SECTION D: الخطبة والطريق ─── */}
        <section className="my-10">
          <div className="flex items-center gap-3 mb-5">
            <SectionIcon>
              <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-[#DAA520]">
                <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
              </svg>
            </SectionIcon>
            <SectionTitle>الخطبة والطريق إلى الزواج المبارك</SectionTitle>
          </div>

          <div className="timeline">
            <div className="timeline-item bg-white dark:bg-gray-800 border border-[#D4C4A0] dark:border-gray-600 rounded-lg p-4 md:p-5 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-sm font-bold text-[#B8860B] dark:text-[#DAA520] mb-1.5">السبب الأول — وفاة زوجها رضي الله عنه</div>
              <div className="text-[clamp(15px,2vw,17px)] leading-8 text-[#3D2B1F] dark:text-gray-200">
                كانت حفصة رضي الله عنها متزوجةً من <span className="text-[#1B4332] dark:text-[#DAA520] font-bold">خنيس بن حذافة السهمي</span> رضي الله عنه، وهو من المهاجرين الأوائل. شهد غزوة بدر ثم غزوة أُحد، وتُوفي رضي الله عنه في المدينة المنورة بعد أن أصابته جراح في أُحد، فأصبحت حفصة أرملةً شابة.
              </div>
            </div>

            <div className="timeline-item bg-white dark:bg-gray-800 border border-[#D4C4A0] dark:border-gray-600 rounded-lg p-4 md:p-5 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-sm font-bold text-[#B8860B] dark:text-[#DAA520] mb-1.5">عرض عمر على عثمان رضي الله عنه</div>
              <div className="text-[clamp(15px,2vw,17px)] leading-8 text-[#3D2B1F] dark:text-gray-200">
                لما تأيَّمت حفصة، أشفق عليها أبوها عمر بن الخطاب رضي الله عنه، فعرضها على <span className="text-[#1B4332] dark:text-[#DAA520] font-bold">عثمان بن عفان</span> رضي الله عنه بعد وفاة زوجته رقية بنت رسول الله ﷺ. فقال له عثمان: «ما أريد أن أتزوج اليوم»، فانصرف عمر حزيناً.
              </div>
            </div>

            <div className="timeline-item bg-white dark:bg-gray-800 border border-[#D4C4A0] dark:border-gray-600 rounded-lg p-4 md:p-5 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-sm font-bold text-[#B8860B] dark:text-[#DAA520] mb-1.5">عرض عمر على أبي بكر رضي الله عنه</div>
              <div className="text-[clamp(15px,2vw,17px)] leading-8 text-[#3D2B1F] dark:text-gray-200">
                ثم لقي عمر <span className="text-[#1B4332] dark:text-[#DAA520] font-bold">أبا بكر الصديق</span> رضي الله عنه فعرض عليه حفصة، فصمت أبو بكر ولم يردَّ شيئاً، فوجد عمر في نفسه من ذلك أكثر مما وجد من عثمان.
              </div>
            </div>

            <div className="timeline-item bg-white dark:bg-gray-800 border border-[#D4C4A0] dark:border-gray-600 rounded-lg p-4 md:p-5 shadow-md hover:shadow-lg transition-shadow">
              <div className="text-sm font-bold text-[#B8860B] dark:text-[#DAA520] mb-1.5">الخطبة الشريفة من النبي ﷺ</div>
              <div className="text-[clamp(15px,2vw,17px)] leading-8 text-[#3D2B1F] dark:text-gray-200">
                فلما كان بعد أيام، خطب رسول الله ﷺ حفصةَ من أبيها عمر رضي الله عنه، فزوَّجها إياه. وذلك في <DateBadge>السنة الثالثة هجرياً</DateBadge>. وعندها جاء أبو بكر رضي الله عنه إلى عمر فقال: «لا تجدن في نفسك، فإن رسول الله ﷺ كان قد ذكر حفصة، فلم أكن لأفشي سرَّ رسول الله ﷺ، ولو تركها لتزوجتها».
              </div>
            </div>
          </div>

          <HadithBox source="رواه النسائي في السنن الكبرى، وأحمد في مسنده — بإسناد حسن">
            جاء عمر بن الخطاب إلى رسول الله ﷺ فقال: يا رسول الله، ألا تتزوج حفصة بنت عمر؟ قال: فقال رسول الله ﷺ: يُنكحها من هو خيرٌ من عثمان، ويتزوج عثمانُ من هي خيرٌ منها
          </HadithBox>
        </section>

        {/* ─── SECTION E: تفاصيل عقد الزواج ─── */}
        <section className="my-10">
          <div className="flex items-center gap-3 mb-5">
            <SectionIcon>
              <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-[#DAA520]">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.18L12 5z" />
              </svg>
            </SectionIcon>
            <SectionTitle>تفاصيل عقد الزواج المبارك</SectionTitle>
          </div>

          <NarrativeCard>
            <p>
              تزوج النبي ﷺ حفصةَ رضي الله عنها في <DateBadge>السنة الثالثة هجرياً</DateBadge> وقيل الرابعة، بعد غزوة بدر الكبرى. وقد كان مهرها <span className="text-[#1B4332] dark:text-[#DAA520] font-bold">أربعمئة درهم</span> على رواية ابن سعد في الطبقات الكبرى.
            </p>
            <p>
              وكان زواجها ﷺ منها تكريماً وعزاءً لأمير المؤمنين <span className="text-[#1B4332] dark:text-[#DAA520] font-bold">عمر بن الخطاب</span> رضي الله عنه، وتوطيداً للروابط بين النبي ﷺ وصاحبيه الصديق والفاروق.
            </p>
          </NarrativeCard>

          <HadithBox source="رواه الحاكم في المستدرك (4/15) وصححه، والطبراني في المعجم الكبير (22/420)، وحسَّنه بعض العلماء">
            إن جبريل أتاني فقال: راجع حفصة، فإنها صوَّامةٌ قوَّامة، وإنها زوجتك في الجنة
          </HadithBox>
        </section>

        {/* ─── SECTION F: فضائل ─── */}
        <section className="my-10">
          <div className="flex items-center gap-3 mb-5">
            <SectionIcon>
              <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-[#DAA520]">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z" />
              </svg>
            </SectionIcon>
            <SectionTitle>فضائل حفصة ومناقبها رضي الله عنها</SectionTitle>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
            <div className="bg-white dark:bg-gray-800 border border-[#D4C4A0] dark:border-gray-600 rounded-lg p-4 md:p-5 text-center shadow-md hover:-translate-y-1 transition-transform">
              <span className="text-[32px] block mb-2">📖</span>
              <div className="text-base font-bold text-[#1B4332] dark:text-[#DAA520] mb-1.5">حافظة القرآن الكريم</div>
              <div className="text-sm text-[#5C4033] dark:text-gray-300 leading-[1.8]">كانت تحفظ القرآن الكريم، وعندها المصحف الأول الذي جُمع في عهد أبي بكر الصديق رضي الله عنه</div>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-[#D4C4A0] dark:border-gray-600 rounded-lg p-4 md:p-5 text-center shadow-md hover:-translate-y-1 transition-transform">
              <span className="text-[32px] block mb-2">🌙</span>
              <div className="text-base font-bold text-[#1B4332] dark:text-[#DAA520] mb-1.5">صوَّامةٌ قوَّامة</div>
              <div className="text-sm text-[#5C4033] dark:text-gray-300 leading-[1.8]">وصفها جبريل عليه السلام بأنها كثيرة الصيام والقيام، وأنها زوجة النبي ﷺ في الجنة</div>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-[#D4C4A0] dark:border-gray-600 rounded-lg p-4 md:p-5 text-center shadow-md hover:-translate-y-1 transition-transform">
              <span className="text-[32px] block mb-2">✍️</span>
              <div className="text-base font-bold text-[#1B4332] dark:text-[#DAA520] mb-1.5">قارئة كاتبة</div>
              <div className="text-sm text-[#5C4033] dark:text-gray-300 leading-[1.8]">من القلة النادرة في عصرها ممن تُحسن القراءة والكتابة، وعلَّمت الشفاء بنت عبدالله الكتابة</div>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-[#D4C4A0] dark:border-gray-600 rounded-lg p-4 md:p-5 text-center shadow-md hover:-translate-y-1 transition-transform">
              <span className="text-[32px] block mb-2">👑</span>
              <div className="text-base font-bold text-[#1B4332] dark:text-[#DAA520] mb-1.5">أم المؤمنين</div>
              <div className="text-sm text-[#5C4033] dark:text-gray-300 leading-[1.8]">نالت شرف أمومة المؤمنين، وكانت ذات رأي وشخصية قوية كأبيها الفاروق رضي الله عنه</div>
            </div>
          </div>
        </section>

        {/* ─── SECTION G: وفاتها ─── */}
        <section className="my-10">
          <div className="flex items-center gap-3 mb-5">
            <SectionIcon>
              <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-[#DAA520]">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </SectionIcon>
            <SectionTitle>وفاتها رضي الله عنها</SectionTitle>
          </div>
          <NarrativeCard>
            <p>
              تُوفيت حفصة رضي الله عنها في المدينة المنورة، وكان ذلك في خلافة <span className="text-[#1B4332] dark:text-[#DAA520] font-bold">معاوية بن أبي سفيان</span> رضي الله عنه، في السنة الخامسة والأربعين من الهجرة على المشهور، وقيل السابعة والعشرين، وهي تبلغ نحو ستين عاماً.
            </p>
            <p>
              صلَّى عليها مروان بن الحكم والي المدينة، ودُفنت في مقبرة <span className="text-[#1B4332] dark:text-[#DAA520] font-bold">البقيع</span> رضي الله عنها وأرضاها، وجعل الجنة مقامها ومستقرها.
            </p>
          </NarrativeCard>
        </section>

        {/* ─── SECTION H: المصادر ─── */}
        <div className="bg-[#1A1008] text-[#F5E6B8] rounded-xl p-6 md:p-8 mt-12 shadow-2xl">
          <h3 className="font-['Scheherazade_New'] text-[22px] font-bold text-[#DAA520] border-b border-[#3D3020] pb-3 mb-5">
            ◆ المصادر والمراجع الموثوقة
          </h3>

          <div className="flex gap-3 items-start mb-4 border-b border-[#2A2015] pb-3.5 text-sm leading-[1.9] last:border-b-0 last:mb-0 last:pb-0">
            <div className="bg-[#1B4332] text-[#DAA520] w-[30px] h-[30px] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">١</div>
            <div>
              <div className="text-[#DAA520] font-semibold text-base">صحيح البخاري</div>
              <div className="text-[#B8C4A0] text-xs ltr text-left mt-0.5">كتاب النكاح، باب عرض الرجل ابنته على أهل الخير — رقم الحديث: 5122</div>
            </div>
          </div>

          <div className="flex gap-3 items-start mb-4 border-b border-[#2A2015] pb-3.5 text-sm leading-[1.9] last:border-b-0 last:mb-0 last:pb-0">
            <div className="bg-[#1B4332] text-[#DAA520] w-[30px] h-[30px] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">٢</div>
            <div>
              <div className="text-[#DAA520] font-semibold text-base">الطبقات الكبرى — ابن سعد</div>
              <div className="text-[#B8C4A0] text-xs ltr text-left mt-0.5">محمد بن سعد الزهري (ت. 230هـ) — الجزء الثامن، ص74–80</div>
            </div>
          </div>

          <div className="flex gap-3 items-start mb-4 border-b border-[#2A2015] pb-3.5 text-sm leading-[1.9] last:border-b-0 last:mb-0 last:pb-0">
            <div className="bg-[#1B4332] text-[#DAA520] w-[30px] h-[30px] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">٣</div>
            <div>
              <div className="text-[#DAA520] font-semibold text-base">السيرة النبوية — ابن هشام</div>
              <div className="text-[#B8C4A0] text-xs ltr text-left mt-0.5">عبدالملك بن هشام (ت. 218هـ) — ذكر زوجات النبي ﷺ</div>
            </div>
          </div>

          <div className="flex gap-3 items-start mb-4 border-b border-[#2A2015] pb-3.5 text-sm leading-[1.9] last:border-b-0 last:mb-0 last:pb-0">
            <div className="bg-[#1B4332] text-[#DAA520] w-[30px] h-[30px] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">٤</div>
            <div>
              <div className="text-[#DAA520] font-semibold text-base">المستدرك على الصحيحين — الحاكم</div>
              <div className="text-[#B8C4A0] text-xs ltr text-left mt-0.5">أبو عبدالله الحاكم النيسابوري (ت. 405هـ) — الجزء الرابع، ص15</div>
            </div>
          </div>

          <div className="flex gap-3 items-start mb-4 border-b border-[#2A2015] pb-3.5 text-sm leading-[1.9] last:border-b-0 last:mb-0 last:pb-0">
            <div className="bg-[#1B4332] text-[#DAA520] w-[30px] h-[30px] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">٥</div>
            <div>
              <div className="text-[#DAA520] font-semibold text-base">أسد الغابة — ابن الأثير</div>
              <div className="text-[#B8C4A0] text-xs ltr text-left mt-0.5">عز الدين ابن الأثير الجزري (ت. 630هـ) — الجزء السابع</div>
            </div>
          </div>

          <div className="flex gap-3 items-start mb-4 border-b border-[#2A2015] pb-3.5 text-sm leading-[1.9] last:border-b-0 last:mb-0 last:pb-0">
            <div className="bg-[#1B4332] text-[#DAA520] w-[30px] h-[30px] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">٦</div>
            <div>
              <div className="text-[#DAA520] font-semibold text-base">الإصابة في تمييز الصحابة — ابن حجر</div>
              <div className="text-[#B8C4A0] text-xs ltr text-left mt-0.5">أحمد بن علي ابن حجر العسقلاني (ت. 852هـ) — الجزء الثامن، ص52، ترجمة رقم 11415</div>
            </div>
          </div>

          <div className="flex gap-3 items-start text-sm leading-[1.9]">
            <div className="bg-[#1B4332] text-[#DAA520] w-[30px] h-[30px] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">٧</div>
            <div>
              <div className="text-[#DAA520] font-semibold text-base">المعجم الكبير — الطبراني</div>
              <div className="text-[#B8C4A0] text-xs ltr text-left mt-0.5">سليمان بن أحمد الطبراني (ت. 360هـ) — الجزء الثاني والعشرون، ص420</div>
            </div>
          </div>
        </div>

      </main>

      {/* ─── FOOTER ─── */}
      <footer
        className="py-6 px-8 text-center text-[#B8DFC8] text-base leading-8 border-t-[3px] border-[#B8860B]"
        style={{background: 'linear-gradient(135deg, #1B4332, #2D6A4F)'}}
      >
        <p>رضي الله عن أمهات المؤمنين جميعاً</p>
        <p>وصلى الله وسلم على نبينا محمد وعلى آله وصحبه أجمعين</p>
      </footer>

      <GeometricBand />
    </div>
  );
}
