(function () {

  angular.module('ui', [
    'angularUtils.directives.dirPagination'
  ])


    .constant('ProfileTag', 'Клиент заполнил профиль')

    .directive('fillProfile', function(SailPlay, $rootScope, $q, ProfileTag, ipCookie){

      return {

        restrict: 'A',
        scope: true,
        link: function(scope){

          var new_form = {

            user: {

              addPhone: '',
              addEmail: '',
              birthDate: ''

            },
            custom_vars: {

              'В браке': '',
              'Имя супруга(и)': '',
              'ДР супруга(и)': '',
              'Дети': ''

            },
            tags: [],
            hide_hist: false

          };

          scope.profile_form = angular.extend(angular.copy(new_form), ipCookie('profile_form'));

          scope.toggle_tag = function(arr, tag){

            if(!tag) return;

            var index = arr.indexOf(tag);

            if(index > -1){

              arr.splice(index, 1);

            }
            else {

              arr.push(tag);

            }

          };

          scope.submit_profile = function(form, callback){

            console.dir(scope.profile_form);

            if(!form.$valid) {
              return;
            }

            var old_state = ipCookie('profile_form');

            var req_user = angular.copy(scope.profile_form.user);

            if(old_state && old_state.user.addPhone == req_user.addPhone){
              delete req_user.addPhone;
            }

            if(old_state && old_state.user.addEmail == req_user.addEmail){
              delete req_user.addEmail;
            }

            ipCookie('profile_form', scope.profile_form);

            scope.profile_form.user.auth_hash = SailPlay.config().auth_hash;

            SailPlay.send('users.update', req_user, function(user_res){

              if(user_res.status === 'ok'){

                var req_tags = angular.copy(scope.profile_form.tags);

                req_tags.push(ProfileTag);


                function chunk(array, chunkSize) {
                  return [].concat.apply([],
                    array.map(function(elem,i) {
                      return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
                    })
                  );
                }

                var chunked_tags = chunk(req_tags, 10);

                var tag_promises = [];

                angular.forEach(chunked_tags, function(chunk){

                  var promise = $q(function(resolve, reject){

                    SailPlay.send('tags.add', { tags: chunk }, function(tags_res){
                      if(tags_res.status === 'ok') {

                        resolve(tags_res);

                        //sp.send('leads.submit.success', { lead: self, response: user_res, tags: res });
                      }
                      else {
                        reject(tags_res);
                        //sp.send('leads.submit.error', { lead: self, response: user_res, tags: res });
                      }
                    });

                  });

                  tag_promises.push(promise);

                });

                $q.all(tag_promises).then(function(tags_res){

                  SailPlay.send('vars.add', { custom_vars: scope.profile_form.custom_vars }, function(vars_res){

                    var response = {
                      user: user_res,
                      tags: tags_res,
                      vars: vars_res
                    };

                    if(vars_res.status === 'ok') {


                      $rootScope.$broadcast('notifier:notify', {

                        header: 'Спасибо',
                        body: 'Данные профиля сохранены'

                      });
                      callback && callback(response);
                      scope.$apply();
                      console.dir(response);


                    }
                    else {

                      console.dir(response);
                      $rootScope.$broadcast('notifier:notify', {

                        header: 'Ошибка',
                        body: user_res.message || 'К сожалению произошла ошибка'

                      });
                      scope.$apply();

                    }

                  });

                });



              }

              else {
                $rootScope.$broadcast('notifier:notify', {

                  header: 'Ошибка',
                  body: $rootScope.locale.errors[user_res.status_code] || $rootScope.locale.errors[user_res.message] || 'К сожалению произошла ошибка'

                });
                $rootScope.$apply();
              }

            });

          };

        }

      };

    })

    .directive('overlayClick', function(){

      return {
        restrict: 'A',
        replace: false,
        scope: false,
        link: function(scope, elm, attrs){

          elm.on('click', function(e){
            if(e.target === elm[0]){
              scope.$apply(function () {
                scope.$eval(attrs.overlayClick);
              });
            }
          });

        }
      };

    })

    .controller('slick_config', function($scope){

      $scope.gift_slider_config = {
        slidesToShow: 3,
        slidesToScroll: 1,
        speed: 150,
        infinite: false,
        prevArrow: '<div class="slick-prev"></div>',
        nextArrow: '<div class="slick-next"></div>',
        swipeToSlide: true,
        responsive: [
          {
            breakpoint: 1000,
            settings: {
              slidesToShow: 2
            }
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 1
            }
          }
        ]
      };

      $scope.action_slider_config = {
        slidesToShow: 3,
        slidesToScroll: 1,
        speed: 150,
        infinite: false,
        prevArrow: '<div class="slick-prev"></div>',
        nextArrow: '<div class="slick-next"></div>',
        swipeToSlide: true,
        responsive: [
          {
            breakpoint: 800,
            settings: {
              slidesToShow: 2
            }
          },
          {
            breakpoint: 600,
            settings: {
              slidesToShow: 1
            }
          }
        ]
      };

    })

    .directive('slickCarousel', function ($compile, $timeout) {
      return {
        restrict:'A',
        link: function (scope, element, attrs) {

          scope.hidden = true;

          var $element = $(element);

          function toggle(state){

            if(state){
              $element.css('opacity', 1);
            }
            else {
              $element.css('opacity', 0);
            }

          }

          var options = scope.$eval(attrs.options) || {
            infinite: false,
            nextArrow: '<img class="slider_arrow right" src="dist/img/right.png"/>',
            prevArrow: '<img class="slider_arrow left" src="dist/img/left.png"/>',
            slidesToShow: 4,
            slidesToScroll: 4,
            responsive: [
              {
                breakpoint: 1190,
                settings: {
                  slidesToShow: 4,
                  slidesToScroll: 4
                }
              },
              {
                breakpoint: 880,
                settings: {
                  slidesToShow: 3,
                  slidesToScroll: 3
                }
              },
              {
                breakpoint: 600,
                settings: {
                  slidesToShow: 2,
                  slidesToScroll: 2
                }
              },
              {
                breakpoint: 480,
                settings: {
                  slidesToShow: 1,
                  slidesToScroll: 1
                }
              }
              // You can unslick at a given breakpoint now by adding:
              // settings: "unslick"
              // instead of a settings object
            ]
          };

          scope.$watchCollection(function(){
            return $element.find('[data-slick-slide]').not('.ng-hide');
          }, function(){
            toggle(false);
            $timeout(function(){
              if($element.hasClass('slick-initialized')){
                $element.slick('removeSlide', null, null, true);
                $element.slick('unslick');
              }
              $element.slick(options);
              $element.slick('slickUnfilter');
              $element.slick('slickFilter', ':not(.ng-hide)');
              toggle(true);
            }, 0);

          });

          //var parent = $(element).parent();
          //console.dir(parent);



        }

      };
    })

    .directive('notifier', function(){

       return {

         restrict: 'E',
         replace: true,
         scope: true,
         templateUrl: '/html/ui/ui.notifier.html',
         link: function(scope){

           var new_data = {

             header: '',
             body: ''

           };

           scope.$on('notifier:notify', function(e, data){

            scope.data = data;
            scope.show_notifier = true;
            console.log('notifier: ' + data.body);

           });

           scope.reset_notifier = function(){
             scope.data = angular.copy(new_data);
             scope.show_notifier = false;
           };

           scope.reset_notifier();

         }

       }

    })

    .directive('phoneMask', function(){

      return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elm, attrs, ngModel){

          ngModel.$validators.phone = function(modelValue, viewValue) {
            var value = (modelValue || viewValue).replace(/\D/g,'');
            if(!value) return true;
            return /^[0-9]{11}$/.test(value);
          };

          $(elm).mask('+7(000) 000-00-00', {placeholder: "+7(___)___-__-__"});

        }
      };

    })

    .directive('selectize', function($timeout){

      return {
        restrict: 'A',
        link: function(scope, elm){

          $timeout(function(){
            $(elm).selectize({});
          }, 0);

        }
      };

    })

    .directive('dateSelector', function($parse){

      return {
        restrict: 'A',
        require: 'ngModel',
        scope: true,
        link: function(scope, elm, attrs, ngModelCtrl){

          scope.selected_date = [ '', '', '' ];

          ngModelCtrl.$formatters.push(function(modelValue) {
            return modelValue ? angular.copy(modelValue).split('-').reverse() : [ '', '', '' ];
          });

          ngModelCtrl.$render = function() {
            scope.selected_date = angular.copy(ngModelCtrl.$viewValue);
          };

          ngModelCtrl.$parsers.push(function(viewValue) {

            var new_date = scope.selected_date && scope.selected_date.some(function(value){
              return value && value !== '';
            }) ? angular.copy(scope.selected_date).reverse().join('-') : '';

            return new_date;

          });

          scope.$watchCollection('selected_date', function(){

            ngModelCtrl.$setViewValue(angular.copy(scope.selected_date));

          });


        }
      };

    });

}());