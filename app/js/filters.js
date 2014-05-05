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
  filter('nameOfDay', function() {
    var dayNames = ['Søndag', 'Måndag', 'Tysdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
    return function(input) {
      return dayNames[input];
    };
  }).
  filter('showDateMetaInfo', function() {  
    var monthNames = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];  
    return function(input) {
      if (input.publicHoliday) {
        return input.publicHoliday;
      }
      var returnString = (input.date.getDate() === 1 ? monthNames[input.date.getMonth()] : '') + 
        (input.date.getDay() === 1 && input.date.getDate() === 1 ? '  ' : '') + 
        (input.date.getDay() === 1 ? input.date.getWeek() : '');

      return returnString;
    };
  }).
  filter('eventStart', function() {
  	return function(input) {
  		if(input) {
  			var startDate = new Date(input);
  			return (startDate.getHours() < 10 ? '0' : '') + startDate.getHours() + '.' + (startDate.getMinutes() < 10 ? '0' : '') + startDate.getMinutes() + ' - ';
  		}
  		return '';
  	};
  }).
  filter('eventEnd', function() {
  	return function(input) {
  		if(input) {
  			var endDate = new Date(input);
  			return (endDate.getHours() < 10 ? '0' : '') + endDate.getHours() + '.' + (endDate.getMinutes() < 10 ? '0' : '') + endDate.getMinutes() + ': ';
  		}
  		return '';
  	};
  });
