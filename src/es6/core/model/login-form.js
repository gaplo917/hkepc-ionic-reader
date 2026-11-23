/**
 * Discuz float login form. The forum index only has the login link.
 * formhash and loginsid are hidden inputs inside the inajax login layer.
 */
export function parseLoginForm(raw) {
  const text = typeof raw === 'string' ? raw : ''
  const cdata = text.match(/<!\[CDATA\[([\s\S]*?)\]\]>/)
  const html = cdata ? cdata[1] : text
  const formMatch = html.match(/<form[^>]*id=["']loginform["'][\s\S]*?<\/form>/i)
  const formHtml = formMatch ? formMatch[0] : html

  const field = (name) => {
    const re = new RegExp(
      `name=["']${name}["'][^>]*value=["']([^"']*)["']|value=["']([^"']*)["'][^>]*name=["']${name}["']`,
      'i'
    )
    const match = formHtml.match(re)
    return match ? match[1] || match[2] || '' : ''
  }

  const formhash = field('formhash')
  const loginsid = field('loginsid')
  if (!formhash || !loginsid) {
    throw new Error('login form is missing formhash or loginsid')
  }

  return {
    formhash,
    loginsid,
    referer: field('referer') || 'https://www.hkepc.com/forum/',
    cookietime: field('cookietime') || '2592000',
  }
}
