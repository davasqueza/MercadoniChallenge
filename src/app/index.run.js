(function() {
  'use strict';

  angular
    .module('App')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log, $route) {
    $route.reload();
    $log.debug('runBlock end');
  }
})();
