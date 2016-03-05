/**
 * Created by Gaplo917 on 31/1/2016.
 */

export class FindMessageRequest {
  static get NAME() { return 'FindMessageRequest'}

  constructor(postId, messageId) {
    this.postId = postId
    this.messageId = messageId
  }
}