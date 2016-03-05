/**
 * Created by Gaplo917 on 31/1/2016.
 */

export class LoginTabUpdateRequest {
  static get NAME() { return 'LoginTabUpdateRequest'}

  constructor(username) {
    this.username = username
  }
}