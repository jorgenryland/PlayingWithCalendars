'use strict';

/* Controllers */

angular.module('myApp.controllers', ['ngSanitize']).
  controller('CalendarCtrl', ['$scope', 'googleCalendar', function ($scope, googleCalendar) {
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
          dates[i] = { 'date' :  new Date( $scope.year, $scope.month, i + 1), 'events' : []};
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
        var startDate, i;
        if (event.start.dateTime) {
          $scope.dates[new Date(event.start.dateTime).getDate() - 1].events[calendarIndex].push(event);
          return;
        }
        startDate = new Date(event.start.date);
        var timespanInMS = new Date(event.end.date) - startDate;
        var endDay = startDate.getDate() + timespanInMS/(1000 * 60 * 60 * 24);
        for (i = startDate.getDate() ; i < Math.min(endDay, $scope.dates.length + 1); i++) {
          $scope.dates[i - 1].events[calendarIndex].push(event);
        }
      },
      setDefaultEventRegValues = function() {
        $scope.selectedStartTime = 25200000;
        $scope.selectedEndTime = 25200000;
        $scope.fullDayOrTimeboxed = 0;
        $scope.recurrence = 0;  
      };

      setDefaultEventRegValues();

      $scope.month = today.getMonth();
      $scope.year = today.getFullYear();      
          
      $scope.numberOfDays = [
        { value:1, label:'1'},
        { value:2, label:'2'},
        { value:3, label:'3'},
        { value:4, label:'4'},
        { value:5, label:'5'},
        { value:6, label:'6'},
        { value:7, label:'7'}
      ];
      $scope.selectedNumberOfDays = $scope.numberOfDays[0];
      
      $scope.icons = [
        { value:'nada', label:'Ikon...'},
        { value:'glyphicon glyphicon-music', label:'<i class="glyphicon glyphicon-music"></i>'},
        { value:'glyphicon glyphicon-headphones', label:'<i class="glyphicon glyphicon-headphones"></i>'},
        { value:'glyphicon glyphicon-glass', label:'<i class="glyphicon glyphicon-glass"></i>'},
        { value:'glyphicon glyphicon-film', label:'<i class="glyphicon glyphicon-film"></i>'},
        { value:'glyphicon glyphicon-plane', label:'<i class="glyphicon glyphicon-plane"></i>'},
        { value:'glyphicon glyphicon-heart', label:'<i class="glyphicon glyphicon-heart"></i>'},
        { value:'glyphicon glyphicon-road', label:'<i class="glyphicon glyphicon-road"></i>'},
      ];
      $scope.selectedIcon = $scope.icons[0].value;

      $scope.loadEvents = function() {
        googleCalendar.loadData().then(function() {
          $scope.calendarsWithEvents = googleCalendar.calendars.filter(isFamilyCalendar);

          $scope.calendarSummaries = $scope.calendarsWithEvents.map(getCalendarSummary);
          $scope.calendarIds = $scope.calendarsWithEvents.map(getCalendarId);
          refreshDatesAndEventsMap();          
        });
      }

      $scope.showCalendarColor = function(calendarIndex, date) {
        var weekDay = date.getDay();
        return $scope.dates[date.getDate() -1].events[calendarIndex].length > 0 ? $scope.calendarsWithEvents[calendarIndex].color 
        : (weekDay === 0 || weekDay === 6 ? '#E6E6E6' : '');
      }

      $scope.getDayBgColor = function(weekDay) {
        return weekDay === 0 || weekDay === 6 ? '#E6E6E6' : '';
      }

      $scope.getCalendarColor = function(calendarIndex) {
        return $scope.calendarsWithEvents[calendarIndex].color;
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

      $scope.setSelected = function ( calendarIndex, date ) {  
        $scope.selectedCalendar = { 'index' : calendarIndex, 'id' : $scope.calendarIds[calendarIndex], 'summary' : $scope.calendarSummaries[calendarIndex]};
        $scope.selectedDay = date.getDate();      
      }

      $scope.saveEvent = function () {
        var startTime, endTime, isFulldayEvent, title, recurrence, description;
        if (this.fullDayOrTimeboxed) {
          startTime = new Date(this.selectedStartTime);
          endTime = new Date(this.selectedEndTime);
          startTime.setYear($scope.year);
          startTime.setMonth($scope.month);
          startTime.setDate($scope.selectedDay);
          endTime.setYear($scope.year);
          endTime.setMonth($scope.month);
          endTime.setDate($scope.selectedDay);          
          if(endTime.getHours() === 0 && endTime.getMinutes() === 0) {
            endTime.setDate(endTime.getDate() + 1);
          }
          isFulldayEvent = false;
        }   
        else {
          startTime = new Date(Date.UTC($scope.year, $scope.month, $scope.selectedDay));
          endTime  = new Date(Date.UTC($scope.year, $scope.month, $scope.selectedDay + this.selectedNumberOfDays.value));
          isFulldayEvent = true;
        }        
        recurrence = this.recurrence === 0 ? null : (this.recurrence === 1 ? 'weekly' : 'yearly');
        description = this.selectedIcon === 'nada' ? null : this.selectedIcon.slice(0);
        this.selectedIcon = this.icons[0];
        title = this.title.slice(0);
        this.title = null;

        this.selectedStartTime = this.selectedEndTime = 25200000;
        this.fullDayOrTimeboxed = this.recurrence = 0;
        this.$hide();

        googleCalendar.saveEvent($scope.selectedCalendar.id, startTime, endTime, title, isFulldayEvent, recurrence, description).then(function() {
          $scope.loadEvents();        
        });      
      }

      $scope.hasEvents = function () {  
        return $scope.dates[$scope.selectedDay - 1].events[$scope.selectedCalendar.index].length > 0;     
      }

      $scope.deleteEvent = function ( eventId, recurringEventId ) {  
        var id = recurringEventId ? recurringEventId : eventId; 
        googleCalendar.deleteEvent($scope.selectedCalendar.id, id).then(function() {
          $scope.loadEvents();        
        });           
      }
      //$scope.loadEvents();
  }]);