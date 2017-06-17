(function() {
  'use strict';

  angular
    .module('App')
    .config(routeConfig);

  function routeConfig($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'app/main/landing/landing.html',
        controller: 'LandingController',
        controllerAs: 'vm'
      })
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
  }

})();
