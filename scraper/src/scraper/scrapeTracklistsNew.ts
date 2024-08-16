import cheerio from 'cheerio'

import downloadPage from '../lib/downloadPage'
import { PlaylistTrack } from '../Types'
import { militaryTime } from '../lib/DateHelpers'


export const scrapeTracklist = async (tracklistUrl: string): Promise<PlaylistTrack[]> => {
  const html = await downloadPage(tracklistUrl)

  const $ = cheerio.load(html)

  const content = $('#content')
  const headers = content.find('h2')

  const timeslots = headers.slice(1)

  return timeslots.toArray().flatMap(s => {
    const $slot = $(s)
    const timeslot = $slot.text().trim()
    const list = $slot.next()

    const tracks = list.children().toArray().map(l => {
      const li  = $(l)
      const [_bullet, artist, song] = li.children()
      const text = li.text()
      const matches = text.match(/\(([^\(]+)\)$/)
      const label = matches == null ? null : matches[1]

      return {
        artist: $(artist).text().trim(),
        song: $(song).text().trim(),
        label: label,
        timeslot: militaryTime(timeslot) ?? ''
      }
    })

    return tracks
  })
}
