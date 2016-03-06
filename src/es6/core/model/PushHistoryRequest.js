/**
 * Created by Gaplo917 on 31/1/2016.
 */

export class PushHistoryRequest {
  static get NAME() { return 'PushHistoryRequest'}

  constructor(any) {
    this.historyObj = any
  }
}