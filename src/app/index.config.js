(function() {
  'use strict';

  angular
    .module('App')
    .config(config);

  /** @ngInject */
  function config($logProvider, uiGmapGoogleMapApiProvider, Google_API_Key) {
    // Enable log
    $logProvider.debugEnabled(true);

    //Gmaps configurations
    uiGmapGoogleMapApiProvider.configure({
      key: Google_API_Key
    });
  }

})();
