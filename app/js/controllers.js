'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('CalendarCtrl', ['$scope', 'googleCalendar', function ($scope, googleCalendar) {
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
        var month = new Date(event.start.date).getMonth();
        return month === $scope.month;
      },
      getCalendarSummary = function(calendar) {
        return calendar.summary;
      },
      createDatesAndEventsMap = function(numberOfCalendars) {
        var lastDayInMonth = new Date( $scope.year, $scope.month + 1, 0 );
        var dates = [];
        var i = 0;
        for (i; i < lastDayInMonth.getDate(); i++) {
          var eventsArray = [];
          eventsArray[numberOfCalendars - 2] = '';
          dates[i] = { 'date' : i + 1, 'events' : eventsArray};
        }
        return dates;
      },
      refreshDatesAndEventsMap = function() {
        $scope.dates = createDatesAndEventsMap($scope.calendarsWithEvents.length);

        $scope.calendarsWithEvents.forEach(function(calendar, calendarIndex) {
          calendar.events.filter(isValidMonth).forEach(function(event) {
            addEventToDatesAndEventsMap(event, calendarIndex);
          })
        }); 
      },
      addEventToDatesAndEventsMap = function(event, calendarIndex) {
        var date = new Date(event.start.date).getDate();
        $scope.dates[date - 1].events[calendarIndex] = event;
      };

      $scope.month = today.getMonth();
      $scope.year = today.getYear();

      $scope.loadEvents = function() {
        googleCalendar.loadData().then(function() {
          $scope.calendarsWithEvents = googleCalendar.calendars.filter(isFamilyCalendar);

          $scope.calendarSummaries = $scope.calendarsWithEvents.map(getCalendarSummary);
          refreshDatesAndEventsMap();          
        });
      }

      $scope.incrementMonth = function() {
        $scope.month += 1;
        refreshDatesAndEventsMap();
      }

      $scope.decrementMonth = function() {
        $scope.month -= 1;
        refreshDatesAndEventsMap();
      }

      $scope.loadEvents();
  }]);