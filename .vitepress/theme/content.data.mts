import { createContentLoader } from 'vitepress'
import { buildContentPages } from './content-policy.mjs'

declare const data: ReturnType<typeof buildContentPages>
export { data }

export default createContentLoader(['guide/*.md', 'tips/*.md', 'cases/*.md', 'plugins/*.md'], {
  includeSrc: true,
  transform: buildContentPages
})
