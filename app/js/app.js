'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers',
  'mgcrea.ngStrap'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', 
  	{templateUrl: 'partials/partial1.html', controller: 'CalendarCtrl'});
  $routeProvider.when('/view2/:calendarId/:year/:month/:day', 
  	{templateUrl: 'partials/partial2.html', controller: 'AddEventCtrl'});
  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
