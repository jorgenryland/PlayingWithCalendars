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
              events : [{ start : { date : '2014-04-12'}}]
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

    it('should create "datesInMonth" with 31 days', function() {
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
        spyOn(GoogleCalendarServiceMock, 'loadData').andCallThrough();       
        scope.loadEvents();

        getAllEventsDeferred.resolve();
        scope.$root.$digest();

        expect(scope.dates).not.toBe([]);
        expect(scope.dates[11].events.length).toBe(1);       
    });

    it('should map calendars summary', function () {          
        spyOn(GoogleCalendarServiceMock, 'loadData').andCallThrough();       
        scope.loadEvents();

        getAllEventsDeferred.resolve();
        scope.$root.$digest();

        expect(scope.calendarSummaries.length).toBe(1); 
        expect(scope.calendarSummaries[0]).toBe('Jørgen');      
    });
  });
});