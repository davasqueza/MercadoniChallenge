(function() {
  'use strict';

  angular
    .module('App')
    .service('LandingService', LandingService);

  /** @ngInject */
  function LandingService($resource, $q, _, Google_API_Key) {

    /*
    * Services:
    *   getDirectionsData: Load a list of directions
    *   geocodeAddress: Transform a raw address to coordinates
    *   geocodeAddressList: Transform a list of raw address to a list of coordinates
    * */
    var service = {
      getDirectionsData: getDirectionsData,
      geocodeAddress: geocodeAddress,
      geocodeAddressList: geocodeAddressList,
      setEPolyFunctions: setEPolyFunctions
    };

    /*
    * Resources
    *   - directions: loads plain text file "addresses.dat"
    *   - geocode: Access to Google Geocode API
    * */
    var resources = {
      directions: $resource("./assets/data/addresses.dat", {}, {'getText': {
        transformResponse: function(data) {
          var transformData = _.filter(data.split("\n"), _.identity);
          return {content: transformData};
        }
      }}),
      geocode: $resource("https://maps.googleapis.com/maps/api/geocode/json", {key: Google_API_Key, components: "country: CO"})
    };

    return service;

    function getDirectionsData() {
      return resources.directions.getText().$promise;
    }

    function geocodeAddress(address) {
      return resources.geocode.get({address: address}).$promise;
    }

    function geocodeAddressList(addressList) {
      var promises = _.map(addressList, geocodeAddress);
      return $q.all(promises);
    }

    /*
    * epolys.js by Mike Williams
    * http://www.geocodezip.com/scripts/v3_epoly.js
    * */
    function setEPolyFunctions(googleMaps) {
      googleMaps.Polyline.prototype.Distance = function() {
        var dist = 0;
        for (var i=1; i < this.getPath().getLength(); i++) {
          dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i-1));
        }
        return dist;
      };

      googleMaps.LatLng.prototype.distanceFrom = function(newLatLng) {
        var EarthRadiusMeters = 6378137.0; // meters
        var lat1 = this.lat();
        var lon1 = this.lng();
        var lat2 = newLatLng.lat();
        var lon2 = newLatLng.lng();
        var dLat = (lat2-lat1) * Math.PI / 180;
        var dLon = (lon2-lon1) * Math.PI / 180;
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = EarthRadiusMeters * c;
        return d;
      };

      googleMaps.Polyline.prototype.GetPointAtDistance = function(metres) {
        // some awkward special cases
        if (metres === 0) return this.getPath().getAt(0);
        if (metres < 0) return null;
        if (this.getPath().getLength() < 2) return null;
        var dist=0;
        var olddist=0;
        for (var i=1; (i < this.getPath().getLength() && dist < metres); i++) {
          olddist = dist;
          dist += googleMaps.geometry.spherical.computeDistanceBetween(
            this.getPath().getAt(i),
            this.getPath().getAt(i-1)
          );
        }
        if (dist < metres) {
          return null;
        }
        var p1= this.getPath().getAt(i-2);
        var p2= this.getPath().getAt(i-1);
        var m = (metres-olddist)/(dist-olddist);
        return new google.maps.LatLng( p1.lat() + (p2.lat()-p1.lat())*m, p1.lng() + (p2.lng()-p1.lng())*m);
      };

      return googleMaps;
    }
  }
})();
