/**
 * Created by Gaplo917 on 31/1/2016.
 */

export class CommonInfoExtractRequest {
  static get NAME() { return 'CommonInfoExtractRequest'}

  constructor(username,pmNotification,postNotification) {
    this.username = username
    this.pmNotification = pmNotification
    this.postNotification = postNotification
  }
}