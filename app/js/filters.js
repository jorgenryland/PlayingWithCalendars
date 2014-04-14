'use strict';

/* Filters */

angular.module('myApp.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]).
  filter('nameOfMonth', function() {
  	var monthNames = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];
  	return function(input) {
  		return monthNames[input];
  	};
  }).
  filter('eventStart', function() {
  	return function(input) {
  		if(input) {
  			var startDate = new Date(input);
  			return startDate.getHours() + '.' + (startDate.getMinutes() < 10 ? '0' : '') + startDate.getMinutes() + ' - ';
  		}
  		return '';
  	};
  }).
  filter('eventEnd', function() {
  	return function(input) {
  		if(input) {
  			var endDate = new Date(input);
  			return endDate.getHours() + '.' + (endDate.getMinutes() < 10 ? '0' : '') + endDate.getMinutes() + ': ';
  		}
  		return '';
  	};
  });
