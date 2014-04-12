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
            getAllEvents: function()
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
      expect(scope.datesInMonth(2014, 3).length).toBe(31);
    });

    it('should create "datesInMonth" with 29 days when februay in leap year', function() {
      expect(scope.datesInMonth(2016, 2).length).toBe(29);
    });

    it('should call getAllEvents service method', function () {
        spyOn(GoogleCalendarServiceMock, 'getAllEvents').andCallThrough();       
        scope.loadEvents();

        getAllEventsDeferred.resolve([]);
        scope.$root.$digest();

        expect(GoogleCalendarServiceMock.getAllEvents).toHaveBeenCalled();        
    });

    it('should map event to correct date', function () {
        var startDate = new Date(),
        calendarsAndEvents = [{
          id : '1234',
          summary : 'Jørgen',
          events : [{ start : { date : '2014-04-12'}}]
        }];        
        spyOn(GoogleCalendarServiceMock, 'getAllEvents').andCallThrough();       
        scope.loadEvents();

        getAllEventsDeferred.resolve(calendarsAndEvents);
        scope.$root.$digest();

        expect(scope.dates).not.toBe([]);
        expect(scope.dates.length).toBe(12);       
    });
  });
});