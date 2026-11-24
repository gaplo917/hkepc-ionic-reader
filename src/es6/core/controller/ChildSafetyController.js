export class ChildSafetyController {
  static get STATE() {
    return 'tab.about-child-safety'
  }

  static get NAME() {
    return 'ChildSafetyController'
  }

  static get CONFIG() {
    return {
      url: '/about/child-safety',
      views: {
        main: {
          templateUrl: 'templates/about/child-safety.html',
          controller: ChildSafetyController.NAME,
          controllerAs: 'vm',
        },
      },
    }
  }
}
