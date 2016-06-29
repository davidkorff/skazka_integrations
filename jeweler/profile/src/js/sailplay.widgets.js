(function () {

  angular.module('sailplay.widgets', [ 'core', 'ui', 'sailplay', 'templates' ])

    .config(function(SailPlayProvider, SailPlayActionsDataProvider, SailPlayBadgesProvider){

      //possible values:
      //url,cookie,remote
      SailPlayProvider.set_auth_type('url');

      _CONFIG && SailPlayProvider.set_config({
        partner_id: _CONFIG.SAILPLAY.partner_id,
        domain: _CONFIG.SAILPLAY.domain,
        lang: 'ru'
      });

      _LOCALE && SailPlayActionsDataProvider.set_actions_data(_LOCALE.actions);

      SailPlayBadgesProvider.set_limits([ 0, 5000 ]);

    })

    .run(function($rootScope, SailPlay){

      $rootScope.locale = _LOCALE || {};

      $rootScope.$on('sailplay-init-success', function(){

        SailPlay.authorize();

      });

    })

    .directive('sailplayWidgets', function(SailPlay, ipCookie){

      return {
        restrict: 'E',
        replace: true,
        scope: true,
        templateUrl: '/html/app.html',
        link: function(scope){

          scope.show_history = false;

          scope.show_statuses_list = false;

          scope.show_profile_info = false;

          scope.show_profile_action = true;

          scope.fill_profile = function(){

            scope.show_profile_info = true;

          };

          scope.close_profile = function(){

            scope.show_profile_action = false;

            scope.show_profile_info = false;

            scope.hide_hist = ipCookie('profile_form') && ipCookie('profile_form').hide_hist;

          };

          scope.open_profile = function(){
            scope.show_profile_info = true;
          };

          SailPlay.on('tags.exist.success', function(res){

            if(res.status === 'ok' && res.tags[0].exist) {

              scope.show_profile_action = false;
              scope.$apply();

            }

          });

          scope.hide_hist = ipCookie('profile_form') && ipCookie('profile_form').hide_hist;

        }
      }

    });

  window.addEventListener('DOMContentLoaded', function(){

    var app_container = document.getElementsByTagName('sailplay-widgets')[0];

    app_container && angular.bootstrap(app_container, [ 'sailplay.widgets' ]);

  });

}());