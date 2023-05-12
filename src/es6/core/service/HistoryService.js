/**
 * Created by Gaplo917 on 10/1/2016.
 */

import moment from 'moment'
import uuid from 'uuid-v4'

export class HistoryService {
  static get NAME () { return 'HistoryService' }

  static get DI () {
    return (LocalStorageService, rx) => new HistoryService(LocalStorageService, rx)
  }

  static get BROWSE_HISTORY () { return 'browse.history' }

  static get BROWSE_HISTORY_STAT () { return 'browse.history.stat' }

  constructor (LocalStorageService, rx) {
    this.localStorageService = LocalStorageService
    this.rx = rx
  }

  save (dateStr, historyList) {
    this.localStorageService.setObject(`${HistoryService.BROWSE_HISTORY}.${dateStr}`, historyList)
  }

  saveStat (stat) {
    this.localStorageService.setObject(HistoryService.BROWSE_HISTORY_STAT, stat)
  }

  add (historyObj) {
    const today = moment().format('YYYYMMDD')

    this.rx.Observable.combineLatest(
      this.getHistoryStat(),
      this.getHistoryAt(today),
      (stat, histories) => {
        return {
          stat,
          histories: histories || []
        }
      }
    ).subscribe(({ stat, histories }) => {
      // // add uuid for the history obj
      historyObj.uuid = uuid()
      historyObj.createdAt = new Date().getTime()

      histories.unshift(historyObj)

      this.save(today, histories)

      const todayStat = stat[today] || {}
      todayStat.count = todayStat.count ? todayStat.count + 1 : 1
      stat[today] = todayStat

      this.saveStat(stat)
    })
  }

  getHistoryStat () {
    return this.localStorageService.getObject(HistoryService.BROWSE_HISTORY_STAT).map(data => data || {})
  }

  getHistoryAt (dateStr) {
    return this.localStorageService.getObject(`${HistoryService.BROWSE_HISTORY}.${dateStr}`).map(data => data || [])
  }

  clearHistory (key) {
    this.save(key, undefined)

    this.getHistoryStat().subscribe(stat => {
      delete stat[key]

      this.saveStat(stat)
    })
  }

  clearAllHistory () {
    const stat = this.getHistoryStat()

    for (const key of Object.keys(stat)) {
      this.save(key, undefined)
    }
    this.saveStat(undefined)
  }
}
