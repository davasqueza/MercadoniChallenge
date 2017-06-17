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
      geocodeAddressList: geocodeAddressList
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
      geocode: $resource("https://maps.googleapis.com/maps/api/geocode/json", {key: Google_API_Key, components: "administrative_area: Bogotá | country: CO"})
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
  }
})();
