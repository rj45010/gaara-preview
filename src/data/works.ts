// 作品集数据（双语）。5 大板块 → 点击展开作品详情。
// 纯数据驱动：增删板块 / 作品只改本文件，Works.jsx 仅负责渲染。
//
// 板块字段：
//   id        唯一标识（用于 framer layoutId 共享元素动画）
//   no        编号 '01'…'05'
//   title     板块标题
//   tagline   索引行右侧一句话
//   items[]   扁平作品列表：{ name, meta?, tags?, link? }
//             点击 item 弹出全屏详情，可补充可选媒体/文案字段：
//             { image?, video?, year?, desc? }（缺省时媒体用占位、简介回退 meta/标签）
//   groups[]  分组作品（与 items 二选一）：{ heading, items: string[] }
//   awards[]  奖项 chip（可选）
//   footer    底部技术/备注一行（可选）

export interface WorkListItem {
  name: string
  meta?: string
  tags?: string[]
  link?: string
  slug?: string
}

export interface WorkGroup {
  heading: string
  items: string[]
}

export interface WorkSection {
  id: string
  no: string
  title: string
  tagline: string
  items?: WorkListItem[]
  groups?: WorkGroup[]
  awards?: string[]
  footer?: string
}

export interface WorksLang {
  title: string
  closeLabel: string
  openLabel: string
  hint: string
  awardsLabel: string
  visitLabel: string
  yearsLabel: string
  detailPlaceholder: string
  phImageLabel: string
  phButtonLabel: string
  countLabel: (n: number) => string
  photosLabel: (n: number) => string
  prevLabel: string
  nextLabel: string
  sections: WorkSection[]
}

export const WORKS: Record<'en', WorksLang> = {
  en: {
    title: 'Works',
    closeLabel: 'Back',
    openLabel: 'Explore',
    hint: 'Keep scrolling',
    awardsLabel: 'Shown at',
    visitLabel: 'See it on Instagram',
    yearsLabel: 'Years',
    detailPlaceholder: '',
    phImageLabel: '',
    phButtonLabel: '',
    countLabel: (n) => `${n} ${n === 1 ? 'work' : 'works'}`,
    photosLabel: (n) => `${n} photos`,
    prevLabel: 'Previous photo',
    nextLabel: 'Next photo',
    sections: [
      {
        id: '2026',
        no: '01',
        title: '2026',
        tagline: '7 works',
        items: [
          { name: 'वन गृह × System', meta: 'Stoneware clay and block print on cotton', tags: ['30 × 30 × 12 ft'], slug: '2026-1' },
          { name: 'वन गृह × System', meta: 'Stoneware clay and block print on cotton', tags: ['10 × 12 × 15 ft'], slug: '2026-2' },
          { name: 'वन गृह / From the top / 1', meta: 'Stoneware, fired at 1200°', tags: ['8 × 16 × 20 in · July 2026'], slug: '2026-3' },
          { name: 'वन गृह / W1', meta: 'Stoneware, fired at 1200°', tags: ['20 × 10 × 15 in · July 2026'], slug: '2026-4' },
          { name: 'वन गृह / R, B and S', meta: 'Stoneware, fired at 1200°', tags: ['December 2025 to March 2026'], slug: '2026-5' },
          { name: 'Initial Mutation', meta: 'Bagru print on cloth', tags: ['8 × 3.5 ft'], slug: '2026-6' },
          { name: 'घोंसला', meta: 'Terracotta at 1000° and stoneware at 1200°', tags: ['6.2 × 4 in and 8 × 6 in · October 2025 and January 2026'], slug: '2026-7' },
        ],
      },
      {
        id: '2025',
        no: '02',
        title: '2025',
        tagline: '1 work',
        items: [
          { name: 'जाली', meta: 'Terracotta', tags: ['Multiple pieces'], slug: '2025-1' },
        ],
      },
      {
        id: '2024',
        no: '03',
        title: '2024',
        tagline: '8 works',
        items: [
          { name: 'वन गृह', meta: 'Terracotta', tags: ['Multiple pieces'], slug: '2024-1' },
          { name: 'वन गृह / T1', meta: 'Terracotta', tags: ['5 × 12 × 11 in to 9 × 12 × 14 in'], slug: '2024-2' },
          { name: 'धारा', meta: 'Terracotta', tags: ['9 × 20 × 6 in'], slug: '2024-3' },
          { name: 'The patch of land', meta: 'Terracotta', tags: ['10 × 11 in · ongoing'], slug: '2024-4' },
          { name: 'रचना', meta: 'Cob, straw and bamboo', tags: ['12 ft across, 12 ft high'], slug: '2024-5' },
          { name: 'आनंदम', meta: 'Bamboo and rope', tags: ['24 in × 28 in × 15 ft'], slug: '2024-6' },
          { name: 'आनंदम', meta: 'Bamboo and rope', tags: ['Multiple pieces'], slug: '2024-7' },
          { name: 'आनंदम', meta: 'Brass and marble', tags: ['8 × 14 × 20 in and 8 × 12 × 16 in'], slug: '2024-8' },
        ],
      },
      {
        id: '2023',
        no: '04',
        title: '2023',
        tagline: '5 works',
        items: [
          { name: 'Walk-through gallery', meta: 'Gaara: cow dung, clay, sand and rice husk', tags: ['15 × 8 × 10 ft'], slug: '2023-1' },
          { name: 'लेपन्', meta: 'Terracotta', tags: ['11 × 14 in and 11 × 11 in'], slug: '2023-2' },
          { name: 'लेपन्', meta: 'Colour pencils on paper', tags: ['12 × 10 in'], slug: '2023-3' },
          { name: 'छाप', meta: 'Terracotta', tags: ['6 × 10 in and 14 in diameter'], slug: '2023-4' },
          { name: 'The Initial Mutation', meta: 'Ink on paper', tags: ['12 × 10 in'], slug: '2023-5' },
        ],
      },
      {
        id: '2020',
        no: '05',
        title: '2020',
        tagline: '1 work',
        items: [
          { name: 'Vinyasa, cottages as sculptures', meta: 'Cob, bamboo and lime', tags: ['Seven cottages · 2020–2021'], slug: '2020-1' },
        ],
      },
    ],
  },
}

export const SECTION_COVERS: Record<string, string> = Object.fromEntries(
  WORKS.en.sections.map((s) => [s.id, `${import.meta.env.BASE_URL}works/covers/${s.id}.jpg`])
)

// 统计一个板块的作品数（items 或 groups 求和），用于索引行 hover 显示
export function sectionCount(section: WorkSection): number {
  if (section.items) return section.items.length
  if (section.groups) return section.groups.reduce((n, g) => n + g.items.length, 0)
  return 0
}
