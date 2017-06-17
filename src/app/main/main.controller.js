(function() {
  'use strict';

  angular
    .module('App')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController() {
    var vm = this;
    vm.mainTest = "Working main controller";
  }
})();
