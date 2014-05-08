'use strict';

/* jasmine specs for controllers go here */

describe('controllers', function(){
  beforeEach(module('myApp.controllers'));
  beforeEach(module('myApp.services'));

  describe('CalendarCtrl', function(){
    var scope, modal, ctrl, q, GoogleCalendarServiceMock, getAllEventsDeferred;

    // define the mock service
    beforeEach(function() {
        GoogleCalendarServiceMock = {
            calendars: [{
              id : '1234',
              summary : 'Jørgen',
              events : [{ start : { date : '2019-05-12'}, end: { date : '2019-05-13'}, summary : "Single event"}, 
                { start : { date : '2019-05-20'}, end : { date : '2019-05-22'}, summary : "Two day event"},
                { start : { dateTime : '2014-05-09T17:00:00+02:00'}, end : { dateTime : '2014-05-09T23:00:00+02:00'}, summary : "Smiles"},
                { start : { date : '2014-05-19'}, end : { date : '2014-05-21'}, summary : "LEAP i Oslo"}]
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
      modal = null;
      q = $q;
      ctrl = $controller('CalendarCtrl', {$scope: scope, googleCalendar : GoogleCalendarServiceMock, $modal : modal});
    }));

    it('should create "dates" with correct number of days', function() {
      var today = new Date();
      var expectedNumberOfDates = new Date( today.getFullYear(), today.getMonth() + 1, 0 ).getDate();
      scope.loadEvents();

      getAllEventsDeferred.resolve();
      scope.$root.$digest();

      expect(scope.dates.length).toBe(scope.pageSize); 
    });

    it('should increment currentStartDate with pageSize when incrementing', function() {
      scope.loadEvents();
      getAllEventsDeferred.resolve();
      scope.$root.$digest();

      var currentStartDate = new Date(scope.currentStartDate.getFullYear(), scope.currentStartDate.getMonth(), scope.currentStartDate.getDate());
      scope.incrementMonth();
     
      var newCurrentStartDate = new Date(scope.currentStartDate.getFullYear(), scope.currentStartDate.getMonth(), scope.currentStartDate.getDate());
      var diff = scope.getDiffNumberOfDays(currentStartDate, newCurrentStartDate);
      
      expect(diff).toBe(scope.pageSize); 
    });

    it('should decrement currentStartDate with pageSize when decrementing', function() {
      scope.loadEvents();
      getAllEventsDeferred.resolve();
      scope.$root.$digest();

      var currentStartDate = new Date(scope.currentStartDate.getFullYear(), scope.currentStartDate.getMonth(), scope.currentStartDate.getDate());
      scope.decrementMonth();
      var newCurrentStartDate = new Date(scope.currentStartDate.getFullYear(), scope.currentStartDate.getMonth(), scope.currentStartDate.getDate());
      var diff = scope.getDiffNumberOfDays(currentStartDate, newCurrentStartDate);

      expect(diff).toBe(-scope.pageSize);
    });

    it('should call loadData service method', function () {
        spyOn(GoogleCalendarServiceMock, 'loadData').andCallThrough();       
        scope.loadEvents();

        getAllEventsDeferred.resolve();
        scope.$root.$digest();

        expect(GoogleCalendarServiceMock.loadData).toHaveBeenCalled();        
    });

    it('should map event to correct date', function () {
        scope.currentStartDate = new Date(2019, 4, 12);        
        scope.loadEvents();

        getAllEventsDeferred.resolve();
        scope.$root.$digest();

        expect(scope.dates).not.toBe([]);
        expect(scope.dates[0].events.length).toBe(2);
        expect(scope.dates[0].events[0].length).toBe(1);       
    });

    it('should map multiple events to same date', function () {
        scope.currentStartDate = new Date(2019, 4, 12);
        scope.loadEvents();

        getAllEventsDeferred.resolve();
        scope.$root.$digest();

        expect(scope.dates).not.toBe([]);
        expect(scope.dates[1].events[1].length).toBe(2);       
    });

    it('should map a two day event over two dates', function () {
        scope.currentStartDate = new Date(2019, 4, 15);
        scope.loadEvents();

        getAllEventsDeferred.resolve();
        scope.$root.$digest();

        expect(scope.dates[5].events[0].length).toBe(1);   
        expect(scope.dates[6].events[0].length).toBe(1);       
    });

   it('should display event splitted over two pages on second page', function () {
      scope.currentStartDate = new Date(2019, 5, 1);
      scope.loadEvents();

      getAllEventsDeferred.resolve();
      scope.$root.$digest();

      expect(scope.dates[0].events[1].length).toBe(1);
    });

    it('should display timeboxed event on correct date (bugfix)', function () {
      scope.currentStartDate = new Date(2014, 4, 5);
      scope.loadEvents();

      getAllEventsDeferred.resolve();
      scope.$root.$digest();

      expect(scope.dates[4].events[0].length).toBe(1);
    });

    it('should not show the same one day event on two succeding pages (bugfix)', function () {
      scope.currentStartDate = new Date(2014, 4, 1);
      scope.loadEvents();

      getAllEventsDeferred.resolve();
      scope.$root.$digest();

      expect(scope.dates[scope.pageSize - 1].events[1].length).toBe(0);      
    });

    it('should display two day event on correct dates (bugfix)', function () {
      scope.currentStartDate = new Date(2014, 4, 17);
      scope.loadEvents();

      getAllEventsDeferred.resolve();
      scope.$root.$digest();

      expect(scope.dates[2].events[0].length).toBe(1);
      expect(scope.dates[3].events[0].length).toBe(1);
    });

    it('should map calendars summary', function () {                
        scope.loadEvents();

        getAllEventsDeferred.resolve();
        scope.$root.$digest();

        expect(scope.calendarSummaries.length).toBe(2); 
        expect(scope.calendarSummaries[0]).toBe('Jørgen');      
    });

    it('should calculate correct index', function () {
      var referenceDate = new Date(new Date().getFullYear() - 3, 1 , 1); 
      scope.currentStartDate = referenceDate;
      scope.loadEvents();

      getAllEventsDeferred.resolve();
      scope.$root.$digest();

      expect(scope.getDiffNumberOfDays(referenceDate, scope.currentStartDate)).toBe(0);
      expect(scope.getDiffNumberOfDays(scope.currentStartDate, new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() + 10))).toBe(10);       
      expect(scope.getDiffNumberOfDays(scope.currentStartDate, new Date(referenceDate.getFullYear() + 1, referenceDate.getMonth() + 1, referenceDate.getDate() + 2))).toBe(396);
      expect(scope.getDiffNumberOfDays(scope.currentStartDate, new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() - 1))).toBe(-1);                   
    });
  });
});