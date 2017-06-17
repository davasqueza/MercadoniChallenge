(function() {
  'use strict';

  angular
    .module('App')
    .controller('LandingController', LandingController);

  /** @ngInject */
  function LandingController(LandingService, _,$mdToast, $log, uiGmapGoogleMapApi) {
    var vm = this;
    vm.map = {};
    vm.markerClickHandler = markerClickHandler;
    vm.userLines = [];

    var lineCoordinates = [];

    /*
    * initMap: Initialize basic map configuration
    * */
    function initMap() {
      vm.mapConfig = {
        center: {
          latitude: 45,
          longitude: -73
        }, zoom: 8
      };
    }


    /*
    * loadDirections: Load directions list to be processed
    * */
    function loadDirections() {
      LandingService.getDirectionsData()
        .then(function (data) {
          geocodeDirections(data.content);
        })
        .catch(function (error) {
          $log.log("Error:", error);

          $mdToast.show(
            $mdToast.simple()
              .textContent("Warning: unable to load directions list, please try later")
              .hideDelay(3000)
          );

        });
    }

    /*
    * geocodeDirections: Process the directions list to obtain places data
    * */
    function geocodeDirections(directions) {
      LandingService.geocodeAddressList(directions)
        .then(function (locations) {
          processLocationsData(locations);
          markersBoundingBox(locations);
        })
        .catch(function (error) {
          $mdToast.log("Error:", error);
          $mdToast.show(
            $mdToast.simple()
              .textContent("Warning: unable to geocode directions list, please try later")
              .hideDelay(3000)
          );
        });
    }

    /*
    * processLocationsData: Process places data to obtain data usable on markers
    * */
    function processLocationsData(locations) {
      vm.locations = _.map(locations, function (location) {
        var place = location.results[0];
        var marker = {
          coords: {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng
          },
          id: place.place_id
        };
        return marker;
      });
    }

    /*
    * markersBoundingBox: Fit map visualization to the current markers list
    * */
    function markersBoundingBox(locations) {
      uiGmapGoogleMapApi.then(function(maps) {
        var bounds = new maps.LatLngBounds();
        _.each(locations, function (location) {
          var place = location.results[0];
          bounds.extend(place.geometry.location);
        });
        vm.map.getGMap().fitBounds(bounds);
      });
    }

    /*
    * markerClickHandler: handler on event of marker click, used for draw lines between markers
    * */
    function markerClickHandler(event) {
      lineCoordinates.push(event.getPosition());
      if(lineCoordinates.length === 2){
        vm.userLines.push(lineCoordinates);
        lineCoordinates = [];
      }
    }

    initMap();
    loadDirections();
  }
})();
