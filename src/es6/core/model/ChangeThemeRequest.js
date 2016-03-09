/**
 * Created by Gaplo917 on 31/1/2016.
 */

export class ChangeThemeRequest {
  static get NAME() { return 'ChangeThemeRequest'}

  constructor(theme) {
    this.theme = theme
  }
}