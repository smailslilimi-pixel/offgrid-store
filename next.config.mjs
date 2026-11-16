const pages = process.env.GITHUB_PAGES === 'true'
export default pages ? {
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
} : {}
