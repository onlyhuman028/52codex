export const bookArtifactSrcExcludes = [
  'docs/superpowers/**',
  'output/**',
  'tmp/**',
]

export function isBookWorkingPath(path) {
  return path.startsWith('docs/superpowers/')
    || path.startsWith('output/')
    || path.startsWith('tmp/')
}
