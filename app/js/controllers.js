'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('CalendarCtrl', ['$scope', '$route', 'googleCalendar', function ($scope, $route, googleCalendar) {
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
      getCalendarId = function(calendar) {
        return calendar.id;
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
          $scope.calendarIds = $scope.calendarsWithEvents.map(getCalendarId);
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

      $scope.setSelected = function ( calendarIndex, year, month, day ) {  
        $scope.selectedCalendar = { 'id' : $scope.calendarIds[calendarIndex], 'summary' : $scope.calendarSummaries[calendarIndex]};
        $scope.selectedDay = day;      
      }

      $scope.saveEvent = function () {
        var startTime, endTime, isFulldayEvent;
        if (this.selectedStartTime && this.selectedEndTime) {
          startTime = new Date(this.selectedStartTime);
          endTime = new Date(this.selectedEndTime);
          startTime.setYear($scope.year);
          startTime.setMonth($scope.month);
          startTime.setDate($scope.selectedDay);
          endTime.setYear($scope.year);
          endTime.setMonth($scope.month);
          endTime.setDate($scope.selectedDay);
          isFulldayEvent = false;
        }   
        else {
          startTime = new Date(Date.UTC($scope.year, $scope.month, $scope.selectedDay));
          endTime  = new Date(Date.UTC($scope.year, $scope.month, $scope.selectedDay + 1));
          isFulldayEvent = true;
        }
        this.$hide();
        googleCalendar.saveEvent($scope.selectedCalendar.id, startTime, endTime, this.title, isFulldayEvent).then(function() {
          $route.reload();        
        });      
      }
      //$scope.loadEvents();
  }])/*.
  controller('AddEventCtrl', ['$scope', '$location', '$routeParams', 'googleCalendar', function($scope, $location, $routeParams, googleCalendar) {
    var startTime, endTime, isFulldayEvent;
    var year = parseInt($routeParams.year),
    month = parseInt($routeParams.month),
    day = parseInt($routeParams.day);

    $scope.saveEvent = function () {
      if ($scope.selectedStartTime && $scope.selectedEndTime) {
        startTime = new Date($scope.selectedStartTime);
        endTime = new Date($scope.selectedEndTime);
        startTime.setYear(year);
        startTime.setMonth(month);
        startTime.setDate(day);
        endTime.setYear(year);
        endTime.setMonth(month);
        endTime.setDate(day);
        isFulldayEvent = false;
      }   
      else {
        startTime = new Date(Date.UTC(year, month, day));
        endTime  = new Date(Date.UTC(year, month, day + 1));
        isFulldayEvent = true;
      }   
      googleCalendar.saveEvent($routeParams.calendarId, startTime, endTime, $scope.title, isFulldayEvent).then(function() {
        $location.path( '/view1' );        
      });          
    }

    $scope.cancel = function() {
      $location.path( '/view1' ); 
    }
  }])*/;