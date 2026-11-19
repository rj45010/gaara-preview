import { motion } from 'framer-motion'
import { SOCIAL_ICONS } from './SocialIcons'
import { FOCUS_POINTS } from '../data/focusPoints'

const SOCIAL_LINKS = [
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/thegaarastudio/' },
  { id: 'email', label: 'Email', href: 'mailto:thegaarastudio@gmail.com' },
]

interface ResumeGroup {
  heading?: string
  sub?: string
  link?: string
  items?: string[]
  rows?: { year: string; what: string; where?: string }[]
  links?: { id: string; label: string; href: string }[]
}
interface ResumeEntry {
  period: string
  place: string
  role?: string
  text?: string
  points?: string[]
  groups?: ResumeGroup[]
}
const CV: ResumeGroup[] = [
  {
    heading: 'Study',
    rows: [
      { year: '2026', what: 'MFA, Art, Media and Performance', where: 'Shiv Nadar University' },
      { year: '2024', what: 'BVA', where: 'Maharaja Sayajirao University, Baroda' },
      { year: '2019', what: 'Schooling', where: 'Maharani Gayatri Devi Girls’ School' },
    ],
  },
  {
    heading: 'Awards',
    rows: [
      { year: '2020', what: 'Gold, Clay Modelling and Installation', where: 'AIU All India Nationals, Amity University, Noida' },
      { year: '2020', what: 'Gold, Clay Modelling; Silver, Installation', where: '35th AIU Youth Festival, North Zone' },
      { year: '2019', what: 'Gold, Installation; Silver, Pakkhi Making', where: 'Inter-college competition, Chandigarh University' },
    ],
  },
  {
    heading: 'Shows',
    rows: [
      { year: '2026', what: 'Group exhibition', where: 'Jaipur Centre for Art × RMZ Foundation, City Palace, Jaipur' },
      { year: '2026', what: 'Thesis show', where: 'Shiv Nadar University' },
      { year: '2025', what: 'Image after Image: First Draft', where: 'Shiv Nadar Institution of Eminence' },
      { year: '2024', what: 'Degree show', where: 'Maharaja Sayajirao University, Baroda' },
      { year: '2023', what: 'Installation, Rann Utsav', where: 'Kutch, Gujarat' },
      { year: '2023', what: 'Upaantya, BVA III sculpture preview', where: 'Faculty of Fine Arts, Vadodara' },
    ],
  },
  {
    heading: 'Workshops and teaching',
    rows: [
      { year: '2026', what: 'Studio Intensive', where: 'Jaipur Centre for Art × RMZ Foundation, City Palace, Jaipur' },
      { year: '2026', what: 'Artist assistant and intern to Vipul Kumar' },
      { year: '2025', what: 'Block printing instructor', where: 'Bagru, Rajasthan' },
      { year: '2024', what: 'Alternative photographic printing with Avinash Aggarwal', where: 'Studio a89, Kaladham, Greater Noida' },
      { year: '2023', what: 'Ceramic workshop with Falguni Bhat', where: 'Faculty of Fine Arts, Vadodara' },
      { year: '2023', what: 'Faculty, ABHYASA 2.0 art retreat', where: 'Vinyasa' },
      { year: '2022', what: 'Faculty, clay modelling, ABHYASA art retreat', where: 'Vinyasa' },
      { year: '2022', what: 'Wood carving camp', where: 'MS University, Baroda' },
      { year: '2020', what: 'Sculpture camp', where: 'Meluha, Jaipur' },
    ],
  },
  {
    heading: 'Building',
    rows: [
      { year: '2024', what: 'Natural building project', where: 'Idika Staycation, Hyderabad' },
      { year: '2020', what: 'Interiors, exterior textures and murals for the cottages', where: 'Vinyasa, The Dance Ashram, Jaipur' },
    ],
  },
]

const RESUME: Record<'en', { title: string; cvTitle: string; entries: ResumeEntry[] }> = {
  en: {
    title: 'About me',
    cvTitle: 'Study, shows and teaching',
    entries: [
      {
        period: 'Shelter',
        place: 'Nests, roofs, the ground',
        text: 'The work starts from shelter: nests, roofs, the shapes something small builds for itself out of whatever is on the ground. I build at both scales, a piece that sits in two hands and a structure you can walk into, and the material is the same either way.',
      },
      {
        period: 'By hand',
        place: 'Nothing thrown or cast',
        text: 'Nothing here is thrown or cast. Terracotta goes up strand over strand, bamboo is lashed at every crossing, mud and thatch are raised on the site they will stand on. It is slow, and the slowness stays in the surface afterwards. That is the part I want kept.',
      },
      {
        period: 'Fire and weather',
        place: 'The last decision is usually not mine',
        text: 'The last decision is usually not mine. What goes into a wood kiln comes out carrying marks I did not choose, and what I build outdoors keeps changing after I walk away from it. रचना has been going back under the vines ever since I finished it, which is a better ending than the one I would have written for it.',
      },
      {
        period: 'Commissions',
        place: 'Gaara Studio',
        text: 'Most of what I make is one piece at a time, for a show, a commission or a site. If you are working on something and the material sounds right, write to me and we can talk about what it would take.',
        groups: [{ heading: '@thegaarastudio', links: SOCIAL_LINKS }],
      },
    ],
  },
}

// 履历条目依次对应 glb 里的聚焦锚点（相机停靠点），顺序须与 entries 一致。
// 名单是唯一真源，见 data/focusPoints.ts（Scene.tsx 也从那里取）。
const POINT_ORDER = FOCUS_POINTS

const EASE = [0.22, 1, 0.36, 1]
const containerV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
}
const itemV = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
}

function Group({ group }: { group: ResumeGroup }) {
  const heading =
    group.link ? (
      <a className="about-link" href={group.link} target="_blank" rel="noopener noreferrer">
        {group.heading}
      </a>
    ) : (
      <span>{group.heading}</span>
    )

  return (
    <motion.div className="tl-group" variants={itemV}>
      <div className="tl-group-head">
        {heading}
        {group.sub && <span className="tl-group-sub">{group.sub}</span>}
      </div>
      {group.items && (
        <ul className="tl-points">
          {group.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      )}
      {group.rows && (
        <ul className="tl-rows">
          {group.rows.map((r, i) => (
            <li key={i} className="tl-row">
              <span className="tl-row-year">{r.year}</span>
              <span>
                {r.what}
                {r.where && <span className="tl-row-where">{r.where}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
      {group.links && (
        <div className="tl-logos">
          {group.links.map((l) => {
            const Icon = SOCIAL_ICONS[l.id as keyof typeof SOCIAL_ICONS]
            return (
              <a
                key={l.id}
                className="tl-logo"
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={l.label}
                title={l.label}
              >
                <Icon />
              </a>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

function Entry({ entry, index }: { entry: ResumeEntry; index: number }) {
  return (
    <motion.div
      className="tl-entry"
      data-point={POINT_ORDER[index]}
      variants={containerV}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
    >
      <motion.span className="tl-dot" variants={itemV} aria-hidden="true" />
      {/* tl-body 包住文字内容（点保持在外做时间轴标记）：移动端可给它加卡片衬底，
          且它紧贴内容高度，不含 tl-entry 用于排布的大 padding。
          用普通 div（非 motion）：framer 变体经 React context 穿透它，叶子元素仍是
          tl-entry 的直接 stagger 子级，入场动画与包裹前完全一致。 */}
      <div className="tl-body">
        <motion.div className="tl-period" variants={itemV}>
          {entry.period}
        </motion.div>
        <motion.div className="tl-head" variants={itemV}>
          <h3 className="tl-place">{entry.place}</h3>
        </motion.div>
        {entry.role && (
          <motion.div className="tl-role" variants={itemV}>
            {entry.role}
          </motion.div>
        )}
        {entry.text && (
          <motion.p className="tl-text" variants={itemV}>
            {entry.text}
          </motion.p>
        )}
        {entry.points && (
          <motion.ul className="tl-points" variants={itemV}>
            {entry.points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </motion.ul>
        )}
        {entry.groups && entry.groups.map((g, i) => <Group key={i} group={g} />)}
      </div>
    </motion.div>
  )
}

export default function Resume({ lang }: { lang: 'en' }) {
  const data = RESUME[lang]
  return (
    <>
      <section className="resume" lang={lang}>
        <motion.h2
          className="resume-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          {data.title}
        </motion.h2>
        <div className="timeline">
          {data.entries.map((e, i) => (
            <Entry key={i} entry={e} index={i} />
          ))}
        </div>
      </section>
      <section className="cv" lang={lang}>
        <h2 className="cv-title">{data.cvTitle}</h2>
        <div className="cv-grid">
          {CV.map((g, i) => (
            <Group key={i} group={g} />
          ))}
        </div>
      </section>
    </>
  )
}
