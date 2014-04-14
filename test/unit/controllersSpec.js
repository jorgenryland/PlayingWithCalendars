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
              events : [{ start : { date : '2014-04-12'}, end: { date : '2014-04-13'}, summary : "Single event"}, 
                { start : { date : '2014-04-20'}, end : { date : '2014-04-22'}, summary : "Two day event"}]
            },
            {
              id : '1111',
              summary : 'Laila',
              events : [{ start : { date : '2014-04-13'}, end : { date : '2014-04-14'}, summary : 'The event' }, 
                { start : { date : '2014-04-13'}, end : { date : '2014-04-14'}, summary : 'Another event' }]
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

    it('should call loadData service method', function () {
        spyOn(GoogleCalendarServiceMock, 'loadData').andCallThrough();       
        scope.loadEvents();

        getAllEventsDeferred.resolve();
        scope.$root.$digest();

        expect(GoogleCalendarServiceMock.loadData).toHaveBeenCalled();        
    });

    it('should map event to correct date', function () {          
        scope.loadEvents();

        getAllEventsDeferred.resolve();
        scope.$root.$digest();

        expect(scope.dates).not.toBe([]);
        expect(scope.dates[11].events.length).toBe(2);
        expect(scope.dates[11].events[0].length).toBe(1);       
    });

    it('should map multiple events to same date', function () {          
        scope.loadEvents();

        getAllEventsDeferred.resolve();
        scope.$root.$digest();

        expect(scope.dates).not.toBe([]);
        expect(scope.dates[12].events[1].length).toBe(2);       
    });

    it('should map a two day event over two dates', function () {          
        scope.loadEvents();

        getAllEventsDeferred.resolve();
        scope.$root.$digest();

        expect(scope.dates[19].events[0].length).toBe(1);   
        expect(scope.dates[20].events[0].length).toBe(1);       
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