/**
 * Created by Gaplo917 on 31/1/2016.
 */

export class NotificationBadgeUpdateRequest {
  static get NAME() { return 'NotificationBadgeUpdateRequest'}

  constructor(pmNotificationCount, postNotificationCount) {
    this.pmNotificationCount = parseInt(pmNotificationCount)
    this.postNotificationCount = parseInt(postNotificationCount)
  }
}