'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
 // .config(function(googleLoginProvider) {
  //      googleLoginProvider.configure({
  //          clientId: '494604444883-iau7ktv29n9u0tvk55rs60shj0d7i6kq.apps.googleusercontent.com',
  //          scopes: ["https://www.googleapis.com/auth/calendar"]
  //      });
  //  })
  .controller('CalendarCtrl', ['$scope', 'googleCalendar', function ($scope, googleCalendar) {
      var today = new Date(),
      datesInMonth = function(year, month) {
        var lastDayInMonth = new Date( year, month, 0 );
        var dates = [];
        var i = 0;
        for (i; i < lastDayInMonth.getDate(); i++) {
          dates[i] = { 'value' : i + 1 };
        }
        return dates;
      },
      isFamilyCalendar = function(calendar) {
        // TODO: Lag regexp
        if (calendar.summary ===  'Jørgen Ryland' || calendar.summary === 'Kontakters fødselsdager og aktiviteter' ||
          calendar.summary === 'Helligdager i Norge') {
          return false;
        }

        return true;
      },
      getCalendarSummary = function(calendar) {
        return calendar.summary;
      };

      $scope.datesInMonth = datesInMonth;
      $scope.datesInCurrentMonth = datesInMonth(today.getFullYear(), today.getMonth() + 1);



      $scope.loadEvents = function() {
        googleCalendar.getAllEvents().then(function(result) {
          result = result.filter(isFamilyCalendar);

          $scope.calendarSummaries = result.map(getCalendarSummary);

          var dates = [];

          for(var i = 0; i < result.length; i++) {
            for(var j = 0; j < result[i].events.length; j++) {
              if(result[i].events[j].start && result[i].events[j].start.date) { 
                var dayString = result[i].events[j].start.date.split("-")[2];
                var calendarDay = parseInt(dayString);
                if (!dates[calendarDay - 1]) {
                  dates[calendarDay - 1] = { 'date' : calendarDay, 'events' : []};
                }
                dates[calendarDay - 1].events[i] = result[i].events[j];
              }
            }
          }

          
          $scope.dates = dates;
        });
      }
  }]);