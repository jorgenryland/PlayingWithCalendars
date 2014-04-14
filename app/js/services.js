'use strict';

/* Services */

angular.module('myApp.services', []).
  value('version', '0.1')
  .service("googleCalendar", function($q) {
     var calendars = [];
     var getAllCalendarsAndEvents = function() {
        var deferred = $q.defer(),
        // get all calendars that the user has on Google Calendar
        getCalendars = function() {          
          gapi.client.load('calendar','v3', function() {
              var stringWithSpacePattern = new RegExp("\\s");
              var request = gapi.client.calendar.calendarList.list({});
              request.B.apiVersion = "v3";
              request.execute(function(resp) {
                  if(!resp.error) {
                    //var calendars = [];
                    for(var i = 0; i < resp.items.length; i++) {          
                        calendars.push({'id' : resp.items[i].id, 'summary' : resp.items[i].summary, 'color' : resp.items[i].backgroundColor});
                    }
                    getEvents();
                  }
                  else {
                    deferred.reject(resp.error);
                  }
              });
          });
        },
        getEvents = function() {
          var numberOfMissingResponses = calendars.length;

          for(var i = 0; i < calendars.length; i++) {
            // bind i to function to allow asynchronous functions inside for loop
            (function(cntr) {
              var request = gapi.client.calendar.events.list({
                calendarId: calendars[i].id
              });
              request.B.apiVersion = "v3";
              request.execute(function(resp) {
                  numberOfMissingResponses--;
                  var calendarIndex = 0;
                  if(!resp.error) {
                    for(var j = 0; j < calendars.length; j++) {
                      if(resp.summary === calendars[j].summary) {
                        calendars[j].events = resp.items;
                        break;
                      }
                    }                    
                  }
                  else {
                    deferred.reject(resp.error);
                  }
                  if (numberOfMissingResponses === 0) {
                    deferred.resolve();
                  }
              });
            })(i);
          } 
        };
        // login to google API before making calls
        gapi.auth.authorize({ 
              client_id: '',
              scope: ["https://www.googleapis.com/auth/calendar"], 
              immediate: true, 
        }, getCalendars);

        return deferred.promise;
    };

    return {
      loadData : getAllCalendarsAndEvents,
      calendars : calendars
    };
 });
