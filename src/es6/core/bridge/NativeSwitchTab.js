// native tabbar send a tabIndex to js
export class NativeSwitchTab {
  static get NAME() { return 'NativeSwitchTab'}

  constructor(tabIndex) {
    this.tabIndex = tabIndex
  }
}