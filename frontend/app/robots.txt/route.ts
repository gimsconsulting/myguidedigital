import { NextResponse } from 'next/server'

export async function GET() {
  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard/
Disallow: /profile/
Disallow: /invoices/
Disallow: /subscription/
Disallow: /affiliation/
Disallow: /demo/manage/
Disallow: /api/
Disallow: /forgot-password/

Sitemap: https://app.myguidedigital.com/sitemap.xml`

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
