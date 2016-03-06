/**
 * Created by Gaplo917 on 10/1/2016.
 */

const moment = require('moment')

export class HistoryService {
  static get NAME() { return 'HistoryService'}

  static get DI() {
    return (LocalStorageService) => new HistoryService(LocalStorageService)
  }

  static get BROWSE_HISTORY() {  return 'browse.history' }

  static get BROWSE_HISTORY_STAT() { return 'browse.history.stat'}

  constructor(LocalStorageService) {
    this.localStorageService = LocalStorageService
  }

  save (dateStr,historyList) {
    this.localStorageService.setObject(`${HistoryService.BROWSE_HISTORY}.${dateStr}`,historyList)
  }

  saveStat(stat) {
    this.localStorageService.setObject(HistoryService.BROWSE_HISTORY_STAT,stat)
  }

  add (historyObj) {
    const stat = this.getHistoryStat()

    const today = moment().format('YYYYMMDD')

    const histories = this.getHistoryAt(today)

    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;
      return v.toString(16)
    })

    // add uuid for the history obj
    historyObj.uuid = uuid
    historyObj.createdAt = new Date().getTime()

    if(Object.keys(histories).length == 0){
      this.save(today,[historyObj])

      stat[today] = {
        count : 1
      }
      this.saveStat(stat)
    }
    else{
      histories.unshift(historyObj)

      stat[today].count += 1

      this.save(today,histories.slice(0, Math.min(histories.length,1000)))
      this.saveStat(stat)
    }
  }
  //remove (historyObj) {
  //  const histories = this.getAllHistory()
  //  let filtered = histories
  //      .filter((obj) => obj.uuid !== historyObj.uuid)
  //
  //  this.save(filtered)
  //
  //}

  getHistoryStat(){
    return this.localStorageService.getObject(HistoryService.BROWSE_HISTORY_STAT)
  }

  getHistoryAt(dateStr){
    return this.localStorageService.getObject(`${HistoryService.BROWSE_HISTORY}.${dateStr}`)
  }

  getAllHistory ()  {
    return this.localStorageService.getObject(HistoryService.BROWSE_HISTORY)
  }

  clearAllHistory() {
    const stat = this.getHistoryStat()

    for(let key of Object.keys(stat)){
      this.save(key,undefined)
    }
    this.saveStat(undefined)

  }
}
