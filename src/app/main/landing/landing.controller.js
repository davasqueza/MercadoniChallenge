(function() {
  'use strict';

  angular
    .module('App')
    .controller('LandingController', LandingController);

  /** @ngInject */
  function LandingController() {
    var vm = this;

    function initMap() {
      vm.mapConfig = {
        center: {
          latitude: 45,
          longitude: -73
        }, zoom: 8
      };
    }

    initMap();
  }
})();
