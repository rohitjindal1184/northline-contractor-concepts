import assert from 'node:assert/strict'
import puppeteer from 'puppeteer-core'

const root = process.env.QA_BASE_URL || 'http://127.0.0.1:5174'
const routes = ['/', '/project-stories', '/daily-build-log', '/field-book', '/category-standard']

function verifyOpenState(state, viewport) {
  assert.equal(state.modalOpen, true, `${viewport}: booking modal did not open`)
  assert.equal(state.modalHidden, 'false', `${viewport}: open modal is hidden from assistive technology`)
  assert.equal(state.bodyOverflow, 'hidden', `${viewport}: background scrolling is not locked`)
  assert.equal(state.activeElementClass, 'booking-modal__close', `${viewport}: focus did not enter the modal`)
  assert.equal(state.iframeTitle, 'TidyCal', `${viewport}: iframe title is incorrect`)
  assert.ok(
    state.iframeSrc.startsWith('https://tidycal.com/rohitjindal1184/create-your-website?embed=1'),
    `${viewport}: iframe source is incorrect`,
  )
  assert.ok(state.iframeWidth >= (viewport === 'desktop' ? 560 : 400), `${viewport}: iframe is too narrow`)
  assert.ok(state.iframeHeight >= 600, `${viewport}: iframe is too short`)
}

async function openAndMeasure(page, viewport) {
  await page.waitForSelector('.booking-banner__button', { visible: true })
  await page.click('.booking-banner__button')
  await page.waitForSelector('.booking-modal--open iframe[src*="tidycal.com"]', { visible: true, timeout: 30000 })
  await new Promise((resolve) => setTimeout(resolve, 800))

  const state = await page.evaluate(() => {
    const modal = document.querySelector('.booking-modal')
    const iframe = document.querySelector('.booking-modal iframe')
    return {
      modalOpen: modal.classList.contains('booking-modal--open'),
      modalHidden: modal.getAttribute('aria-hidden'),
      bodyOverflow: document.body.style.overflow,
      activeElementClass: document.activeElement.className,
      iframeWidth: Math.round(iframe.getBoundingClientRect().width),
      iframeHeight: Math.round(iframe.getBoundingClientRect().height),
      iframeTitle: iframe.title,
      iframeSrc: iframe.src,
    }
  })
  verifyOpenState(state, viewport)
  return state
}

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

try {
  const page = await browser.newPage()
  const routeCoverage = {}

  for (const route of routes) {
    await page.goto(`${root}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    routeCoverage[route] = await page.$eval('.booking-banner__button', (button) => ({
      visible: button.getBoundingClientRect().height >= 44,
      text: button.textContent.replace(/\s+/g, ' ').trim(),
    }))
    assert.equal(routeCoverage[route].visible, true, `${route}: booking banner button is not visible`)
    assert.match(routeCoverage[route].text, /Schedule a meeting/i, `${route}: booking action label is missing`)
  }

  await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 })
  await page.goto(`${root}/`, { waitUntil: 'networkidle2', timeout: 30000 })
  await page.evaluate(() => window.scrollTo(0, 900))
  await new Promise((resolve) => setTimeout(resolve, 150))
  const bannerTopAfterScroll = await page.$eval('.booking-banner', (banner) => Math.round(banner.getBoundingClientRect().top))
  assert.equal(bannerTopAfterScroll, 0, 'desktop: booking banner is not sticky')
  const desktop = await openAndMeasure(page, 'desktop')
  await page.screenshot({ path: '.impeccable/review/booking-modal-desktop.png' })
  await page.keyboard.press('Escape')
  await page.waitForFunction(() => !document.querySelector('.booking-modal').classList.contains('booking-modal--open'))
  const desktopClose = await page.evaluate(() => ({
    bodyOverflow: document.body.style.overflow,
    focusReturned: document.activeElement.classList.contains('booking-banner__button'),
  }))
  assert.equal(desktopClose.bodyOverflow, '', 'desktop: background scrolling did not unlock')
  assert.equal(desktopClose.focusReturned, true, 'desktop: focus did not return to the banner button')

  await page.setViewport({ width: 500, height: 900, deviceScaleFactor: 1 })
  await page.goto(`${root}/category-standard`, { waitUntil: 'networkidle2', timeout: 30000 })
  const mobile = await openAndMeasure(page, 'mobile')
  await page.screenshot({ path: '.impeccable/review/booking-modal-mobile.png' })
  await page.click('.booking-modal__close')
  await page.waitForFunction(() => !document.querySelector('.booking-modal').classList.contains('booking-modal--open'))

  console.log(JSON.stringify({ routeCoverage, bannerTopAfterScroll, desktop, desktopClose, mobile }, null, 2))
} finally {
  await browser.close()
}
