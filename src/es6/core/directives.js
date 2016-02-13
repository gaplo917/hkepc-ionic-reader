/**
 * Created by Gaplo917 on 31/1/2016.
 */
/**
 * Register the directives
 */
angular.module('starter.directives', [])

.directive('compile', ['$compile', ($compile) => {
  return (scope, element, attrs) => {
    scope.$watch(
        (scope) => {
          return scope.$eval(attrs.compile);
        },
        (value) => {
          element.html(value);
          $compile(element.contents())(scope);
        }
    )};
}])