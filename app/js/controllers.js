'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('CalendarCtrl', ['$scope', '$location', 'googleCalendar', function ($scope, $location, googleCalendar) {
      var today = new Date(),               
      isFamilyCalendar = function(calendar) {
        // TODO: Lag regexp
        if (calendar.summary ===  'Jørgen Ryland' || calendar.summary === 'Kontakters fødselsdager og aktiviteter' ||
          calendar.summary === 'Helligdager i Norge' || calendar.summary === 'Ukenumre') {
          return false;
        }

        return true;
      },
      isValidMonth = function(event) {
        var date;
        if (event.start.date) {
          date = new Date(event.start.date);
        }
        else {
          date = new Date(event.start.dateTime);
        } 
        return date.getMonth() === $scope.month && date.getFullYear() === $scope.year;
      },
      getCalendarSummary = function(calendar) {
        return calendar.summary;
      },
      createDatesAndEventsMap = function(calendars) {
        var lastDayInMonth = new Date( $scope.year, $scope.month + 1, 0 );
        var dates = [];
        var i, j;
        for (i = 0; i < lastDayInMonth.getDate(); i++) {
          dates[i] = { 'date' : i + 1, 'events' : []};
          for (j = 0; j < calendars.length; j++) {
            dates[i].events.push([]);
          }                   
        }
        return dates;
      },
      refreshDatesAndEventsMap = function() {
        $scope.dates = createDatesAndEventsMap($scope.calendarsWithEvents);

        $scope.calendarsWithEvents.forEach(function(calendar, calendarIndex) {
          calendar.events.filter(isValidMonth).forEach(function(event) {
            addEventToDatesAndEventsMap(event, calendarIndex);
          })
        }); 
      },
      addEventToDatesAndEventsMap = function(event, calendarIndex) {
        var startDate;
        if (event.start.dateTime) {
          $scope.dates[new Date(event.start.dateTime).getDate() - 1].events[calendarIndex].push(event);
          return;
        }
        var i = new Date(event.start.date).getDate();
        var endDate = new Date(event.end.date).getDate();
        for (i; i < endDate; i++) {
          $scope.dates[i - 1].events[calendarIndex].push(event);
        }
      };

      $scope.month = today.getMonth();
      $scope.year = today.getFullYear();

      $scope.loadEvents = function() {
        googleCalendar.loadData().then(function() {
          $scope.calendarsWithEvents = googleCalendar.calendars.filter(isFamilyCalendar);

          $scope.calendarSummaries = $scope.calendarsWithEvents.map(getCalendarSummary);
          refreshDatesAndEventsMap();          
        });
      }

      $scope.getBgColor = function(calendarIndex, dateIndex) {
        return $scope.dates[dateIndex].events[calendarIndex].length > 0 ? $scope.calendarsWithEvents[calendarIndex].color : '';
      }

      $scope.incrementMonth = function() {
        if ($scope.month === 11) {
          $scope.month = 0;
          $scope.year+= 1;          
        }
        else {
          $scope.month += 1;
        }
        refreshDatesAndEventsMap();
      }

      $scope.decrementMonth = function() {
        if ($scope.month === 0) {
          $scope.month = 11;
          $scope.year -= 1;          
        }
        else {
          $scope.month -= 1;
        }        
        refreshDatesAndEventsMap();
      }

      $scope.go = function ( calendarIndex, year, month, day ) {
        $location.path( '/view2' );
      }

      //$scope.loadEvents();
  }]).
  controller('AddEventCtrl', ['$scope', 'googleCalendar', function($scope, googleCalendar) {

  }]);