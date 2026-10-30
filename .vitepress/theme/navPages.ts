import { data } from './content.data'

const images = import.meta.glob('/{guide,tips,cases,plugins}/assets/**/*.{svg,png,jpg,jpeg,webp,gif}', { eager: true, query: '?url', import: 'default' })
export const contentPages = data.map(page => ({ ...page, cover: images[page.cover] as string || page.cover }))
const section = (name: string) => contentPages.filter(page => !page.hidden && !page.isIndex && page.link.startsWith(`/${name}/`))
export const guidePages = section('guide')
export const tipPages = contentPages.filter(page => !page.hidden && page.link.startsWith('/tips/'))
export const casePages = section('cases')
export const pluginPages = section('plugins')
export const skillPages = pluginPages.filter(page => page.tags.includes('Skill'))
export const pluginToolPages = pluginPages.filter(page => !page.tags.includes('Skill'))
