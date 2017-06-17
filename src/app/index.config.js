(function() {
  'use strict';

  angular
    .module('App')
    .config(config);

  /** @ngInject */
  function config($logProvider, uiGmapGoogleMapApiProvider, Google_API_Key, $mdIconProvider) {
    // Enable log
    $logProvider.debugEnabled(true);

    //Gmaps configurations
    uiGmapGoogleMapApiProvider.configure({
      key: Google_API_Key,
      libraries: "geometry"
    });

    //Icons configuration
    $mdIconProvider
      .icon("unicorn", "./assets/icons/unicorn-head-horse-with-a-horn.svg", 24);
  }

})();
