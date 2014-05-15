'use strict';

/* Controllers */

angular.module('myApp.controllers', ['ngSanitize']).
  controller('CalendarCtrl', ['$scope', 'googleCalendar', '$modal', '$timeout', '$window', function ($scope, googleCalendar, $modal, $timeout, $window) {
      var today = new Date(),
      pollRetry = false,               
      isFamilyCalendar = function(calendar) {
        // TODO: Lag regexp
        if (calendar.summary ===  'Jørgen Ryland' || calendar.summary === 'Kontakters fødselsdager og aktiviteter' ||
          calendar.summary === 'Helligdager i Norge' || calendar.summary === 'Ukenumre') {
          return false;
        }

        return true;
      },      
      isPublicHolidayCalendar = function(calendar) {
        return calendar.summary === 'Helligdager i Norge' ? true : false;          
      },
      isPublicHoliday = function(event) {
        // TODO: Lag regexp
        if (event.summary === 'nyttårsdag' || 
          event.summary === 'palmesøndag' ||
          event.summary === 'skjærtorsdag' || 
          event.summary === 'langfredag' ||
          event.summary === '1. påskedag' || 
          event.summary === '2. påskedag' ||
          event.summary === 'offentlig høytidsdag' || 
          event.summary === 'grunnlovsdag' ||
          event.summary === 'Kristi Himmelfartsdag' || 
          event.summary === '1. pinsedag' ||
          event.summary === '2. pinsedag' || 
          event.summary === 'julaften' ||
          event.summary === '1. juledag' || 
          event.summary === '2. juledag' ||
          event.summary === 'nyttårsaften') {
          return true;
        }

        return false;
      },
      isValidMonth = function(event) {
        var startDate, endDate, validMonth;
        var firstUnvalidDate = new Date( $scope.currentStartDate.getFullYear(), $scope.currentStartDate.getMonth(), $scope.currentStartDate.getDate() + $scope.pageSize);
        if (event.start.date) {
          startDate = new Date(event.start.date);
          endDate = new Date(event.end.date);
        }
        else {
          startDate = new Date(event.start.dateTime);
          endDate = new Date(event.end.dateTime);
        } 
        validMonth = $scope.getDiffNumberOfDays($scope.currentStartDate, startDate) >= 0 && $scope.getDiffNumberOfDays(startDate, firstUnvalidDate) > 0 || 
          $scope.getDiffNumberOfDays($scope.currentStartDate, endDate) >= 0 && $scope.getDiffNumberOfDays(endDate, firstUnvalidDate) > 0;
        //if(validMonth) {
        //  console.log('Current ' + $scope.currentStartDate + ', ' + startDate + ' - ' + endDate);
        //}
        return validMonth;
      },
      getCalendarSummary = function(calendar) {
        return calendar.summary;
      },
      getCalendarId = function(calendar) {
        return calendar.id;
      },      
      refreshDatesAndEventsMap = function() {
        $scope.dates = createDatesAndEventsMap($scope.calendarsWithEvents);

        $scope.calendarsWithEvents.forEach(function(calendar, calendarIndex) {
          calendar.events.filter(isValidMonth).forEach(function(event) {
            addEventToDatesAndEventsMap(event, calendarIndex);
          })
        }); 

        $scope.publicHolidaysCalendar.forEach(function(calendar) {
          calendar.events.filter(isPublicHoliday).filter(isValidMonth).forEach(function(event) {
            addPublicHolidayEventToDatesAndEventsMap(event);
          })
        });
      },      
      createDatesAndEventsMap = function(calendars) {
        var dates = [];
        var i, j;
        for (i = 0; i < $scope.pageSize; i++) {
          dates[i] = { 'date' :  new Date( $scope.currentStartDate.getFullYear(), $scope.currentStartDate.getMonth(), $scope.currentStartDate.getDate() + i), 'events' : []};
          for (j = 0; j < calendars.length; j++) {
            dates[i].events.push([]);
          }                   
        }
        return dates;
      },      
      addEventToDatesAndEventsMap = function(event, calendarIndex) {      
        var startDate, i, index;
        if (event.start.dateTime) {
          $scope.dates[$scope.getDiffNumberOfDays($scope.currentStartDate, new Date(event.start.dateTime))].events[calendarIndex].push(event);
          return;
        }
        startDate = new Date(event.start.date);
        var startIndex = $scope.getDiffNumberOfDays($scope.currentStartDate, startDate);
        
        var durationInDays = $scope.getDiffNumberOfDays(startDate, new Date(event.end.date));
        
        for (i = startIndex ; i < Math.min(startIndex + durationInDays, $scope.pageSize); i++) {
          if (i >= 0) {
            $scope.dates[i].events[calendarIndex].push(event);
          }
        }
      },
      addPublicHolidayEventToDatesAndEventsMap  = function(event) {      
        var index = $scope.getDiffNumberOfDays($scope.currentStartDate, new Date(event.start.date));
        console.log(event.summary);
        if(index >= 0) {
          $scope.dates[index].publicHoliday = event.summary;
        }
      },
      setDefaultEventRegValues = function() {
        $scope.selectedStartTime = 25200000;
        $scope.selectedEndTime = 25200000;
        $scope.fullDayOrTimeboxed = 0;
        $scope.recurrence = 0;  
      },
      // TODO: Fix mocking in tests.. 
      modal = $modal ? $modal({scope: $scope, template: 'partials/create-event-modal.html', show: false}) : null;     

      setDefaultEventRegValues();

      $scope.pageSize = 7;    
      $scope.currentStartDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      $scope.lastPoll = today;
          
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
        { value:'glyphicon glyphicon-camera', label:'<i class="glyphicon glyphicon-camera"></i>'},
        { value:'glyphicon glyphicon-gift', label:'<i class="glyphicon glyphicon-gift"></i>'},
        { value:'glyphicon glyphicon-picture', label:'<i class="glyphicon glyphicon-picture"></i>'},
        { value:'glyphicon glyphicon-shopping-cart', label:'<i class="glyphicon glyphicon-shopping-cart"></i>'},
        { value:'glyphicon glyphicon-wrench', label:'<i class="glyphicon glyphicon-wrench"></i>'},
        { value:'glyphicon glyphicon-globe', label:'<i class="glyphicon glyphicon-globe"></i>'},
        { value:'glyphicon glyphicon-tree-conifer', label:'<i class="glyphicon glyphicon-tree-conifer"></i>'},
        { value:'glyphicon glyphicon-pencil', label:'<i class="glyphicon glyphicon-pencil"></i>'},
      ];
      $scope.selectedIcon = $scope.icons[0].value;

      $scope.getDiffNumberOfDays = function(startDate, endDate) {
        var strippedStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        var strippedEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()); 
        var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
        var days = Math.round((strippedEndDate.getTime() - strippedStartDate.getTime())/(oneDay));        
        return days;
      }

      $scope.loadEvents = function(login, refresh) {
        $scope.loading = true;
        googleCalendar.loadData(login, refresh).then(function() {
          pollRetry = false;
          $scope.calendarsWithEvents = googleCalendar.calendars.filter(isFamilyCalendar);
          $scope.publicHolidaysCalendar = googleCalendar.calendars.filter(isPublicHolidayCalendar);

          $scope.calendarSummaries = $scope.calendarsWithEvents.map(getCalendarSummary);
          $scope.calendarIds = $scope.calendarsWithEvents.map(getCalendarId);
          refreshDatesAndEventsMap();
          $scope.lastPoll = new Date();
          $timeout($scope.loadEvents, 60000);        
        },
        function(error) {
          console.log('Error: ' + error.message);
          $scope.lastError = error.message;
          if(!pollRetry) {
            pollRetry = true;
            $scope.loadEvents(true, true);
          }
        });
      }

      $scope.showCalendarColor = function(calendarIndex, day) {
        var weekDay = day.date.getDay();
        var dateIndex = $scope.getDiffNumberOfDays($scope.currentStartDate, day.date);
        return $scope.dates[dateIndex].events[calendarIndex].length > 0 ? $scope.calendarsWithEvents[calendarIndex].color 
        : (weekDay === 0 || weekDay === 6 || day.publicHoliday ? '#E6E6E6' : '');
      }

      $scope.getDayBgColor = function(day) {
        return day.date.getDay() === 0 || day.date.getDay() === 6 || day.publicHoliday ? '#E6E6E6' : '';
      }

      $scope.getDayFontColor = function(day) {
        return day.date.getDay() === 0 || day.date.getDay() === 6 || day.publicHoliday ? 'red' : '';
      }

      $scope.getCalendarColor = function(calendarIndex) {
        return $scope.calendarsWithEvents[calendarIndex].color;
      }

      $scope.incrementMonth = function() {
        $scope.currentStartDate = new Date($scope.currentStartDate.getFullYear(), $scope.currentStartDate.getMonth(), $scope.currentStartDate.getDate() + $scope.pageSize );
        refreshDatesAndEventsMap();
      }

      $scope.decrementMonth = function() {
        $scope.currentStartDate = new Date($scope.currentStartDate.getFullYear(), $scope.currentStartDate.getMonth(), $scope.currentStartDate.getDate() - $scope.pageSize );
        refreshDatesAndEventsMap();
      }

      $scope.setSelected = function ( calendarIndex, date ) {  
        $scope.selectedCalendar = { 'index' : calendarIndex, 'id' : $scope.calendarIds[calendarIndex], 'summary' : $scope.calendarSummaries[calendarIndex]};
        $scope.selectedDate = date;
        modal.$promise.then(modal.show);     
      }

      $scope.startDateSort = function(event) {
        if(!event.start.dateTime) {
          return 0;
        }
        return new Date(event.start.dateTime).getTime();
      }

      $scope.saveEvent = function () {
        var startTime, endTime, isFulldayEvent, title, recurrence, description;
        if (this.fullDayOrTimeboxed) {
          startTime = new Date(this.selectedStartTime);
          endTime = new Date(this.selectedEndTime);
          startTime.setYear($scope.selectedDate.getFullYear());
          startTime.setMonth($scope.selectedDate.getMonth());
          startTime.setDate($scope.selectedDate.getDate());
          endTime.setYear($scope.selectedDate.getFullYear());
          endTime.setMonth($scope.selectedDate.getMonth());
          endTime.setDate($scope.selectedDate.getDate());          
          if(endTime.getHours() === 0 && endTime.getMinutes() === 0) {
            endTime.setDate(endTime.getDate() + 1);
          }
          isFulldayEvent = false;
        }   
        else {
          startTime = new Date(Date.UTC($scope.selectedDate.getFullYear(), $scope.selectedDate.getMonth(), $scope.selectedDate.getDate()));
          endTime  = new Date(Date.UTC($scope.selectedDate.getFullYear(), $scope.selectedDate.getMonth(), $scope.selectedDate.getDate() + this.selectedNumberOfDays.value));
          isFulldayEvent = true;
        }        
        recurrence = this.recurrence === 0 ? null : (this.recurrence === 1 ? 'weekly' : 'yearly');
        description = this.selectedIcon === 'nada' ? null : this.selectedIcon.slice(0);
        this.selectedIcon = this.icons[0].value;
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
        var index = $scope.getDiffNumberOfDays($scope.currentStartDate, $scope.selectedDate);
        if (index < 0 || index > $scope.pageSize) {
          return false;
        }
        return $scope.dates[index].events[$scope.selectedCalendar.index].length > 0;
      }

      $scope.deleteEvent = function ( eventId, recurringEventId ) {  
        var id = recurringEventId ? recurringEventId : eventId; 
        googleCalendar.deleteEvent($scope.selectedCalendar.id, id).then(function() {
          $scope.loadEvents();        
        });           
      }

      //$scope.loadEvents();
  }]);