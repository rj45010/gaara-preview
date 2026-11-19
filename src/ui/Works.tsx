import { useEffect, useRef, useState, type Ref } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { WORKS, SECTION_COVERS, type WorkListItem, type WorkSection, type WorksLang } from '../data/works'
import { getWorkDoc } from '../data/workDocs'

const EASE = [0.22, 1, 0.36, 1]

// 极简清单的一行：作品名靠左、数据(播放量/标签)靠右、发丝线分隔；整行可点开全屏详情
function WorkLine({
  item,
  onOpen,
  onPreview,
}: {
  item: WorkListItem
  onOpen: (item: WorkListItem) => void
  onPreview: (item: WorkListItem) => void
}) {
  const hasMeta = item.meta || (item.tags && item.tags.length)
  return (
    <li className="wk-line">
      <button
        className="wk-line-btn"
        onClick={() => onOpen(item)}
        onMouseEnter={() => onPreview(item)}
        onFocus={() => onPreview(item)}
      >
        <span className="wk-line-name">{item.name}</span>
        {hasMeta && (
          <span className="wk-line-meta">
            {item.meta && <span className="wk-line-num">{item.meta}</span>}
            {item.tags &&
              item.tags.map((t, i) => (
                <span key={i} className="wk-line-tag">
                  {t}
                </span>
              ))}
          </span>
        )}
      </button>
    </li>
  )
}

// 一张全高板块卡：左侧整高配图，右侧文字（编号 + 标题 + 清单）
function SectionCard({
  section,
  data,
  onOpen,
}: {
  section: WorkSection
  data: WorksLang
  onOpen: (item: WorkListItem) => void
}) {
  const [coverError, setCoverError] = useState(false)
  const [preview, setPreview] = useState<WorkListItem | null>(null)
  const cover = preview?.slug ? `${import.meta.env.BASE_URL}works/${preview.slug}/1.jpg` : SECTION_COVERS[section.id]
  return (
    <div className="wk-card">
      <div className="wk-card-head">
        <h3 className="wk-card-title">{section.title}</h3>
        <span className="wk-card-tagline">{section.tagline}</span>
      </div>
      <div className="wk-card-cover">
        {cover && !coverError ? (
          <img src={cover} alt={preview?.name ?? ''} onError={() => setCoverError(true)} />
        ) : (
          <div className="wk-card-cover-ph" aria-hidden="true">
            <span className="wk-card-cover-no">{section.no}</span>
          </div>
        )}
      </div>
      <SectionWorks section={section} data={data} onOpen={onOpen} onPreview={setPreview} />
    </div>
  )
}

// 板块内的作品清单（items 扁平 / groups 分组 / awards · footer 底部小字）
function SectionWorks({
  section,
  data,
  onOpen,
  onPreview,
}: {
  section: WorkSection
  data: WorksLang
  onOpen: (item: WorkListItem) => void
  onPreview: (item: WorkListItem) => void
}) {
  return (
    <div className="wk-card-body">
      {section.items && (
        <ul className="wk-list">
          {section.items.map((it, i) => (
            <WorkLine key={i} item={it} onOpen={onOpen} onPreview={onPreview} />
          ))}
        </ul>
      )}

      {section.groups &&
        section.groups.map((g, gi) => (
          <div key={gi} className="wk-sub">
            <div className="wk-sub-head">{g.heading}</div>
            <ul className="wk-list">
              {g.items.map((it, i) => (
                <WorkLine key={i} item={{ name: it }} onOpen={onOpen} onPreview={onPreview} />
              ))}
            </ul>
          </div>
        ))}

      {(section.awards || section.footer) && (
        <div className="wk-foot">
          {section.awards && (
            <p className="wk-foot-line">
              <span className="wk-foot-label">{data.awardsLabel}</span>
              <span className="wk-foot-val accent">{section.awards.join('  ·  ')}</span>
            </p>
          )}
          {section.footer && <p className="wk-foot-line">{section.footer}</p>}
        </div>
      )}
    </div>
  )
}

const PHOTO = /!\[([^\]]*)\]\(([^)]+)\)/g

function WorkDetail({
  item,
  data,
  onClose,
}: {
  item: WorkListItem
  data: WorksLang
  onClose: () => void
}) {
  const doc = getWorkDoc(item.slug)
  const title = (doc && doc.title) || item.name
  const body = doc?.body ?? ''
  const photos = [
    ...(doc?.banner ? [{ src: doc.banner, alt: title }] : []),
    ...Array.from(body.matchAll(PHOTO), (m) => ({ src: m[2], alt: m[1] })),
  ]
  const notes = body.replace(PHOTO, '').trim()
  const link = doc ? doc.link || item.link : null
  const pageRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const [travel, setTravel] = useState(0)

  useEffect(() => {
    const strip = stripRef.current
    const view = viewRef.current
    if (!strip || !view) return
    const measure = () => setTravel(Math.max(0, strip.scrollWidth - view.clientWidth))
    const observer = new ResizeObserver(measure)
    observer.observe(strip)
    observer.observe(view)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const page = pageRef.current
    const track = trackRef.current
    const strip = stripRef.current
    if (!page || !track || !strip) return
    const onScroll = () => {
      const moved = Math.min(Math.max(-track.getBoundingClientRect().top, 0), travel)
      strip.style.transform = `translate3d(${-moved}px, 0, 0)`
    }
    onScroll()
    page.addEventListener('scroll', onScroll, { passive: true })
    return () => page.removeEventListener('scroll', onScroll)
  }, [travel])

  return (
    <motion.div
      className="wk-detail"
      ref={pageRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      <button className="wk-detail-close" onClick={onClose} aria-label={data.closeLabel}>
        ✕
      </button>

      <article className="wk-detail-article">
        <h3 className="wk-detail-title">{title}</h3>
        {item.meta && <div className="wk-detail-sub">{item.meta}</div>}
        {item.tags && item.tags.length > 0 && <div className="wk-detail-sub">{item.tags.join(' · ')}</div>}
        {notes && (
          <div className="wk-md">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {notes}
            </ReactMarkdown>
          </div>
        )}
        {link && (
          <a className="wk-detail-link" href={link} target="_blank" rel="noopener noreferrer">
            {data.visitLabel} <span aria-hidden="true">↗</span>
          </a>
        )}
      </article>

      <div className="wk-detail-track" ref={trackRef} style={{ height: `calc(100vh + ${travel}px)` }}>
        <div className="wk-detail-view" ref={viewRef}>
          <div className="wk-detail-strip" ref={stripRef}>
            {photos.map((p) => (
              <img key={p.src} src={p.src} alt={p.alt} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Works({ lang, innerRef }: { lang: 'en'; innerRef: Ref<HTMLElement> }) {
  const data = WORKS[lang]
  const sections = data.sections

  const [active, setActive] = useState<WorkListItem | null>(null)
  const [current, setCurrent] = useState(0)
  const galleryRef = useRef<HTMLDivElement>(null)

  const chooseYear = (index: number) => {
    setCurrent(index)
    const gallery = galleryRef.current
    if (!gallery) return
    const top = gallery.getBoundingClientRect().top + window.scrollY
    if (window.scrollY <= top) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top, behavior: still ? 'auto' : 'smooth' })
  }

  const open = (item: WorkListItem) => {
    history.pushState({ work: item.slug }, '', `#${item.slug}`)
    setActive(item)
  }

  const close = () => {
    if (history.state?.work) return history.back()
    history.replaceState(null, '', location.pathname + location.search)
    setActive(null)
  }

  useEffect(() => {
    const slug = location.hash.slice(1)
    const linked = sections.flatMap((s) => s.items ?? []).find((it) => it.slug === slug)
    if (linked) setActive(linked)
    const onPop = () => setActive(null)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [sections])

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [active])

  const section = sections[current]

  return (
    <section className="works" lang={lang} ref={innerRef}>
      <div className="wk-gallery wk-by-year" ref={galleryRef}>
        <header className="wk-years-head">
          <h2 className="wk-gallery-title">{data.title}</h2>
          <nav className="wk-years" aria-label={data.yearsLabel}>
            {sections.map((s, i) => (
              <button
                key={s.id}
                className="wk-year"
                aria-current={i === current ? 'true' : undefined}
                onClick={() => chooseYear(i)}
              >
                {s.title}
              </button>
            ))}
          </nav>
        </header>

        <SectionCard key={section.id} section={section} data={data} onOpen={open} />
      </div>

      {createPortal(
        <AnimatePresence>
          {active && (
            <WorkDetail key={active.slug || active.name} item={active} data={data} onClose={close} />
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  )
}
