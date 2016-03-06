/**
 * Created by Gaplo917 on 10/1/2016.
 */
export class HistoryService {
  static get NAME() { return 'HistoryService'}

  static get DI() {
    return (LocalStorageService) => new HistoryService(LocalStorageService)
  }

  static get BROWSE_HISTORY() {  return 'browse.history' }

  constructor(LocalStorageService) {
    this.localStorageService = LocalStorageService
  }

  save (historyList) {
    this.localStorageService.setObject(HistoryService.BROWSE_HISTORY,historyList)
  }

  add (historyObj) {
    const histories = this.getAllHistory()

    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;
      return v.toString(16)
    })

    // add uuid for the history obj
    historyObj.uuid = uuid

    if(Object.keys(histories).length == 0){
      this.save([historyObj])
    }
    else{
      histories.push(historyObj)

      this.save(histories.slice(0, Math.min(histories.length,100)))
    }
  }
  remove (historyObj) {
    const histories = this.getAllHistory()
    let filtered = histories
        .filter((obj) => obj.uuid !== historyObj.uuid)

    this.save(filtered)

  }

  getAllHistory ()  {
    return this.localStorageService.getObject(HistoryService.BROWSE_HISTORY)
  }
}
