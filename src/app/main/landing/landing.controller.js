(function() {
  'use strict';

  angular
    .module('App')
    .controller('LandingController', LandingController);

  /** @ngInject */
  function LandingController(LandingService, _,$mdToast, $log, uiGmapGoogleMapApi, UnicornImage, $interval) {
    var vm = this;

    vm.map = {};
    vm.userLines = [];
    vm.markerClickHandler = markerClickHandler;
    vm.enableRouteCalculation = enableRouteCalculation;

    var googleMaps;
    var lineCoordinates = [];
    var directionsCoordinates = [];
    var unicorn;
    var unicornPath;
    var unicornMovementInterval;
    var unicornSpeed = 0.005;
    var markerClickEvent = "Compute_Distance";

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
        googleMaps = LandingService.setEPolyFunctions(maps);
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
        var place = _.first(location.results);
        var coordinates = new googleMaps.LatLng(place.geometry.location);
        directionsCoordinates.push(coordinates);
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
        var place = _.first(location.results);
        bounds.extend(place.geometry.location);
      });
      vm.map.getGMap().fitBounds(bounds);
    }

    /*
     * markerClickHandler: redirect to the respective handler according to the current event
     * */
    function markerClickHandler(event) {
      var position = event.getPosition();
      switch(markerClickEvent){
        case "Compute_Distance":
          calculateDistance(position);
          break;
        case "Start_Route":
          startRoute(position);
      }
    }

    /*
    * calculateDistance: collects positions to calculate distance
    * */
    function calculateDistance(position) {
      lineCoordinates.push(position);
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
      var label = calculatePointsDistance(lineCoordinates[0], lineCoordinates[1]).toString() + " mts";
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
    function calculatePointsDistance(startPoint, endPoint) {
      var distance = googleMaps.geometry.spherical.computeDistanceBetween(startPoint, endPoint);
      return Number(distance.toFixed(2));
    }

    /*
    * enableRouteCalculation: start the detection of route planning
    * */
    function enableRouteCalculation() {
      markerClickEvent = "Start_Route";
      $mdToast.show(
        $mdToast.simple()
          .textContent("Please select the initial point for start the route calculation")
          .hideDelay(3000)
      );
    }

    /*
     * startRoute: define and start the route of the unicorn
     * */
    function startRoute(firstDirection) {
      if(_.isEmpty(directionsCoordinates)){
        return;
      }

      var leftDirections = _.reject(directionsCoordinates, function (direction) {
        return direction.equals(firstDirection);
      });

      var route = calculateRoute(firstDirection, leftDirections);
      var unicorn = createUnicorn();
      animateUnicorn(unicorn, route);
    }

    /*
     * calculateRoute: compute the best route starting by the initial point
     * */
    function calculateRoute(firstDirection, leftDirections) {
      markerClickEvent = "Compute_Distance";
      var route = [];
      route.push(firstDirection);
      var currentDirection = firstDirection;

      while (!_.isEmpty(leftDirections)){
        var nearestDistance = Infinity;
        var nextDirection = undefined;
        _.each(leftDirections, function (direction) {
          var distance = calculatePointsDistance(currentDirection, direction);
          if(distance < nearestDistance){
            nearestDistance = distance;
            nextDirection = direction;
          }
        });
        leftDirections = _.reject(leftDirections, function (direction) {
          return direction.equals(nextDirection);
        });
        route.push(nextDirection);
        currentDirection = nextDirection;
      }
      return route;
    }

    /*
     * createUnicorn: Create a marker with a unicorn icon
     * */
    function createUnicorn() {
      if(!_.isUndefined(unicorn)){
        return unicorn;
      }
      unicorn = new googleMaps.Marker({
        icon: {
          //url: "http://www.vayagif.com/images/banano.gif",
          url: UnicornImage,
          scaledSize: new googleMaps.Size(70,70)
        },
        map: vm.map.getGMap(),
        optimized: false
      });
      return unicorn;
    }

    /*
     * animateUnicorn: animate the unicorn along the route
     * */
    function animateUnicorn(unicorn, route) {
      if(!_.isUndefined(unicornMovementInterval)){
        $interval.cancel(unicornMovementInterval);
      }

      if(_.isUndefined(unicornPath)){
        unicornPath = new googleMaps.Polyline({
          strokeColor: '#5a0000',
          strokeOpacity: 1.0,
          strokeWeight: 2,
          map: vm.map.getGMap()
        });
      }
      unicornPath.setPath(route);
      unicorn.setPosition(_.first(route));

      var pathLength = unicornPath.Distance();
      var percentage = 0;

      unicornMovementInterval = $interval(function () {
        percentage += unicornSpeed;
        var distance = pathLength*(percentage)/100;
        var unicornPosition = unicornPath.GetPointAtDistance(distance);
        unicorn.setPosition(unicornPosition);
        if(percentage > 100){
          $interval.cancel(unicornMovementInterval);
          unicorn.setPosition(_.last(route));
        }
      });
    }

    initMap();
  }
})();
