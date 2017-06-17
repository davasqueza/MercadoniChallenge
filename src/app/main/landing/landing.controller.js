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

    var googleMaps;
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
      uiGmapGoogleMapApi.then(function(maps) {
        googleMaps = maps;
        loadDirections();
      });
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
      var bounds = new googleMaps.LatLngBounds();
      _.each(locations, function (location) {
        var place = location.results[0];
        bounds.extend(place.geometry.location);
      });
      vm.map.getGMap().fitBounds(bounds);
    }

    /*
    * markerClickHandler: handler on event of marker click, used for draw lines between markers
    * */
    function markerClickHandler(event) {
      lineCoordinates.push(event.getPosition());
      if(lineCoordinates.length === 2){
        vm.userLines.push(lineCoordinates);
        showDistanceLabel(lineCoordinates);
        lineCoordinates = [];
      }
    }

    /*
    * showDistanceLabel: Show the distance label on the middle of the given coordinates
    * */
    function showDistanceLabel(lineCoordinates) {
      var map = vm.map.getGMap();
      var midLatLng = calculateMiddlePoint(lineCoordinates, map);
      var label = calculatePointsDistance(lineCoordinates).toString() + " mts";
      var infowindow = new googleMaps.InfoWindow({
        content: label
      });
      infowindow.open(map);
      infowindow.setPosition(midLatLng);
    }

    /*
    * calculateMiddlePoint: Calculate the geodesic middle point between two point
    * https://stackoverflow.com/a/9090409
    * */
    function calculateMiddlePoint(lineCoordinates, map) {
      var projection = map.getProjection();

      var startLatLng = lineCoordinates[0];
      var endLatLng = lineCoordinates[1];
      var startPoint = projection.fromLatLngToPoint(startLatLng);
      var endPoint = projection.fromLatLngToPoint(endLatLng);
      // Average
      var midPoint = new googleMaps.Point(
        (startPoint.x + endPoint.x) / 2,
        (startPoint.y + endPoint.y) / 2);
      // Unproject
      var midLatLng = projection.fromPointToLatLng(midPoint);
      return midLatLng;
    }

    /*
    * calculatePointsDistance: calculate the distance between two points
    * */
    function calculatePointsDistance(lineCoordinates) {
      var startPoint = new google.maps.LatLng(lineCoordinates[0].lat(), lineCoordinates[0].lng());
      var endPoint = new google.maps.LatLng(lineCoordinates[1].lat(), lineCoordinates[1].lng());
      var distance = googleMaps.geometry.spherical.computeDistanceBetween(startPoint, endPoint);
      return distance.toFixed(2);
    }

    initMap();
  }
})();
