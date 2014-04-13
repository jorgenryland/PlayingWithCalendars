'use strict';

/* jasmine specs for filters go here */

describe('filter', function() {
  beforeEach(module('myApp.filters'));


  describe('interpolate', function() {
    beforeEach(module(function($provide) {
      $provide.value('version', 'TEST_VER');
    }));


    it('should replace VERSION', inject(function(interpolateFilter) {
      expect(interpolateFilter('before %VERSION% after')).toEqual('before TEST_VER after');
    }));
  });

  describe('nameOfMonth', function() {
    it('should convert month values to month names',
        inject(function(nameOfMonthFilter) {
      expect(nameOfMonthFilter(0)).toBe('Januar');
      expect(nameOfMonthFilter(6)).toBe('Juli');
    }));
  });
});
