/**
 * Created by Gaplo917 on 30/1/2017.
 */
export class HideUsernameRequest {
  static get NAME() { return 'HideUsernameRequest'}

  constructor(hidden) {
    this.hidden = hidden
  }
}