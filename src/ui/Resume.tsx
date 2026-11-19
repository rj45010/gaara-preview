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
const RESUME: Record<'en', { title: string; entries: ResumeEntry[] }> = {
  en: {
    title: 'About me',
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
      {
        period: 'Study and shows',
        place: 'Where I learned',
        text: 'I did my MFA in Art, Media and Performance at Shiv Nadar University, after a BVA at MSU Baroda and MGD before that. Gaara is what those years turned into.',
        points: [
          'MFA, Art, Media and Performance, Shiv Nadar University, ’26',
          'BVA, Maharaja Sayajirao University, Baroda, ’24',
          'Maharani Gayatri Devi Girls’ School, ’19',
          'Gold, Clay Modelling and Installation, AIU All India Nationals, Amity University, Noida, ’20',
          'Gold, Clay Modelling, and Silver, Installation, 35th AIU Youth Festival, North Zone, ’20',
          'Gold, Installation, and Silver, Pakkhi Making, inter-college competition, Chandigarh University, ’19',
          'Group exhibition, Jaipur Centre for Art × RMZ Foundation, City Palace, Jaipur, ’26',
          'Studio Intensive, Jaipur Centre for Art × RMZ Foundation, City Palace, Jaipur, ’26',
          'Thesis show, Shiv Nadar University, ’26',
          'Artist assistant and intern to Vipul Kumar, ’26',
          'Image after Image: First Draft, Shiv Nadar Institution of Eminence, ’25',
          'Block printing instructor, Bagru, Rajasthan, ’25',
          'Degree show, Maharaja Sayajirao University, Baroda, ’24',
          'Natural building project, Idika Staycation, Hyderabad, ’24',
          'Alternative photographic printing processes with Avinash Aggarwal, Studio a89, Kaladham, Greater Noida, ’24',
          'Installation, Rann Utsav, Kutch, Gujarat, ’23',
          'Upaantya, BVA III sculpture preview show, Faculty of Fine Arts, Vadodara, ’23',
          'Ceramic workshop with Falguni Bhat, Faculty of Fine Arts, Vadodara, ’23',
          'Faculty, ABHYASA 2.0 art retreat, Vinyasa, ’23',
          'Faculty, clay modelling, ABHYASA art retreat, Vinyasa, ’22',
          'Wood carving camp, MS University, Baroda, ’22',
          'Sculpture camp, Meluha, Jaipur, ’20',
          'Natural building project, Vinyasa – The Dance Ashram, Jaipur: interiors, exterior textures and murals for the cottages, ’20',
        ],
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
  )
}
