/**
 * Created by Gaplo917 on 3/10/2017.
 */
export class NativeHideUsernameRequest {
  static get NAME() { return 'NativeHideUsernameRequest'}

  constructor(bool) {
    this.hideUsername = bool
  }
}