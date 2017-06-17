(function() {
  'use strict';

  angular
    .module('App')
    .controller('LandingController', LandingController);

  /** @ngInject */
  function LandingController() {
    var vm = this;
    vm.test = "Working landing controller";
  }
})();
