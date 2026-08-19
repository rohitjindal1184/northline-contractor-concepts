import { execFileSync } from 'node:child_process'

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const root = process.env.QA_BASE_URL || 'http://127.0.0.1:5174'
const shots = [
  ['gallery-desktop.png', '/', '1440,1100'],
  ['gallery-mobile.png', '/', '500,900'],
  ['stories-desktop.png', '/project-stories', '1440,1100'],
  ['stories-mobile.png', '/project-stories', '500,900'],
  ['daily-desktop.png', '/daily-build-log', '1440,1100'],
  ['daily-mobile.png', '/daily-build-log', '500,900'],
  ['field-desktop.png', '/field-book', '1440,1100'],
  ['field-mobile.png', '/field-book', '500,900'],
  ['standard-desktop.png', '/category-standard', '1440,1100'],
  ['standard-mobile.png', '/category-standard', '500,900'],
]

const filter = process.argv[2]
const selectedShots = filter ? shots.filter(([name]) => name.includes(filter)) : shots

for (const [name, route, size] of selectedShots) {
  execFileSync(chrome, [
    '--headless=new',
    '--hide-scrollbars',
    '--disable-gpu',
    '--virtual-time-budget=2500',
    `--window-size=${size}`,
    `--screenshot=.impeccable/review/${name}`,
    `${root}${route}`,
  ], { stdio: 'ignore' })
  console.log(`captured ${name}`)
}
