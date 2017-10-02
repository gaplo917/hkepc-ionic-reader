/**
 * Created by Gaplo917 on 3/10/2017.
 */
export class NativeChangeThemeRequest {
  static get NAME() { return 'NativeChangeThemeRequest'}

  constructor(theme) {
    this.theme = theme
  }
}