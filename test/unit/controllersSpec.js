'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function(){
  beforeEach(module('myApp.controllers'));
  beforeEach(module('myApp.services'));

  describe('CalendarCtrl', function(){
    var scope, ctrl, q, GoogleCalendarServiceMock, getAllEventsDeferred;

    // define the mock service
    beforeEach(function() {
        GoogleCalendarServiceMock = {
            calendars: [{
              id : '1234',
              summary : 'Jørgen',
              events : [{ start : { date : '2019-05-12'}, end: { date : '2019-05-13'}, summary : "Single event"}, 
                { start : { date : '2019-05-20'}, end : { date : '2019-05-22'}, summary : "Two day event"}]
            },
            {
              id : '1111',
              summary : 'Laila',
              events : [{ start : { date : '2019-05-13'}, end : { date : '2019-05-14'}, summary : 'The event' }, 
                { start : { date : '2019-05-13'}, end : { date : '2019-05-14'}, summary : 'Another event' },
                { start : { date : '2019-05-31'}, end : { date : '2019-06-02'}, summary : 'Event spaning over months' }]
            }],
            loadData: function()
            {
              getAllEventsDeferred = q.defer();
              return getAllEventsDeferred.promise;
            }
       };
    });

    beforeEach(inject(function($rootScope, $q, $controller) {      
      scope = $rootScope.$new();
      q = $q;
      ctrl = $controller('CalendarCtrl', {$scope: scope, googleCalendar : GoogleCalendarServiceMock});
    }));

    it('should create "dates" with correct number of days', function() {
      var today = new Date();
      var expectedNumberOfDates = new Date( today.getFullYear(), today.getMonth() + 1, 0 ).getDate();
      scope.loadEvents();

      getAllEventsDeferred.resolve();
      scope.$root.$digest();

      expect(scope.dates.length).toBe(expectedNumberOfDates); 
    });

    it('should increment year when incrementing month number 12', function() {
      scope.loadEvents();
      getAllEventsDeferred.resolve();
      scope.$root.$digest();

      var currentMonth = scope.month,
      currentYear = scope.year, i;
      
      for (i = currentMonth; i < 12; i++) {
        scope.incrementMonth();
      }
      expect(scope.month).toBe(0); 
      expect(scope.year).toBe(currentYear + 1); 
    });

    it('should decrement year when decrementing month number 1', function() {
      scope.loadEvents();
      getAllEventsDeferred.resolve();
      scope.$root.$digest();

      var currentMonth = scope.month,
      currentYear = scope.year, i;
      
      for (i = currentMonth; i >= 0; i--) {
        scope.decrementMonth();
      }
      expect(scope.month).toBe(11); 
      expect(scope.year).toBe(currentYear - 1); 
    });

    it('should call loadData service method', function () {
        spyOn(GoogleCalendarServiceMock, 'loadData').andCallThrough();       
        scope.loadEvents();

        getAllEventsDeferred.resolve();
        scope.$root.$digest();

        expect(GoogleCalendarServiceMock.loadData).toHaveBeenCalled();        
    });

    it('should map event to correct date', function () {
        scope.year = 2019;
        scope.month = 4;
        scope.loadEvents();

        getAllEventsDeferred.resolve();
        scope.$root.$digest();

        expect(scope.dates).not.toBe([]);
        expect(scope.dates[11].events.length).toBe(2);
        expect(scope.dates[11].events[0].length).toBe(1);       
    });

    it('should map multiple events to same date', function () {
        scope.year = 2019;
        scope.month = 4;
        scope.loadEvents();

        getAllEventsDeferred.resolve();
        scope.$root.$digest();

        expect(scope.dates).not.toBe([]);
        expect(scope.dates[12].events[1].length).toBe(2);       
    });

    it('should map a two day event over two dates', function () {
        scope.year = 2019;
        scope.month = 4;
        scope.loadEvents();

        getAllEventsDeferred.resolve();
        scope.$root.$digest();

        expect(scope.dates[19].events[0].length).toBe(1);   
        expect(scope.dates[20].events[0].length).toBe(1);       
    });

   it('should display event splitted over two pages on second page', function () {
      scope.year = 2019;
      scope.month = 5;
      scope.loadEvents();

      getAllEventsDeferred.resolve();
      scope.$root.$digest();

      expect(scope.dates[0].events[1].length).toBe(1);
    });

    it('should map calendars summary', function () {                
        scope.loadEvents();

        getAllEventsDeferred.resolve();
        scope.$root.$digest();

        expect(scope.calendarSummaries.length).toBe(2); 
        expect(scope.calendarSummaries[0]).toBe('Jørgen');      
    });
  });
});