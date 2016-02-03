/**
 * Created by Gaplo917 on 31/1/2016.
 */
/**
 * Register the directives
 */
angular.module('starter.directives', [])

.directive('compile', ['$compile', function ($compile) {
  return function(scope, element, attrs) {
    scope.$watch(
        function(scope) {
          return scope.$eval(attrs.compile);
        },
        function(value) {
          element.html(value);
          $compile(element.contents())(scope);
        }
    )};
}])