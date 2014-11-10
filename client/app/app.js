'use strict';

angular.module('evtrsScrollApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngAnimate',
        'ui.router',
        'textAngular',
        'restangular',
        'duScroll'
    ])
    .value('duScrollDuration', 1200)
    .config(function ($httpProvider, RestangularProvider) {

        $httpProvider.interceptors.push('authInterceptor');

        RestangularProvider.setBaseUrl('/api');
        RestangularProvider.setRestangularFields({id: '_id'});

    })

    .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
        return {
            // Add authorization token to headers
            request: function (config) {
                config.headers = config.headers || {};
                if ($cookieStore.get('token')) {
                    config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
                }
                return config;
            },

            // Intercept 401s and redirect you to login
            responseError: function (response) {
                if (response.status === 401) {
                    $location.path('/login');
                    // remove any stale tokens
                    $cookieStore.remove('token');
                    return $q.reject(response);
                }
                else {
                    return $q.reject(response);
                }
            }
        };
    })

    .run(function ($rootScope, $location, Auth, $document) {
        // Redirect to login if route requires auth and you're not logged in
        $rootScope.$on('$stateChangeStart', function (event, next) {
            Auth.isLoggedInAsync(function (loggedIn) {
                if (next.authenticate && !loggedIn) {
                    $location.path('/login');
                }
            });
        });

        $rootScope.$on('duScrollspy:becameActive', function ($event, $element) {
            //Automaticly update location on scroll
//            $location.path($element.prop('pathname'));
//            $rootScope.$apply();

        });

        //TODO move navbar to directive to avoid global dom queries
        $document.on('scroll', function () {
            var navbar = angular.element($document[0].querySelector('.navbar'));
            var navbarFixed = angular.element($document[0].querySelector('.navbar-fixed-top'));
            var path = $location.path();

            if (path.indexOf('/admin') > -1) {
                navbarFixed.addClass('top-nav-collapse');
            } else {
                if (navbar.offset().top > 599) {
                    navbarFixed.addClass('top-nav-collapse');
                } else {
                    navbarFixed.removeClass('top-nav-collapse');
                }
            }
        });
    });