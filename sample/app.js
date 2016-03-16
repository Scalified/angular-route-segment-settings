var app = angular.module('app', ['ngRoute', 'route-segment', 'view-segment', 'route-segment-settings'])
    .config(function ($routeProvider, $routeSegmentProvider, $httpProvider, $routingSettingsProvider) {
        'use strict';

        $routeSegmentProvider.options.autoLoadTemplates = true;
        $routingSettingsProvider.configure(routingConfig);
        $routeProvider
            .otherwise({redirectTo: '/home'});
    })
    .run(function ($rootScope) {
        'use strict';
        $rootScope.$on('routeSegmentChange', function (event, route) {
            if (route.segment) {
                $rootScope.title = route.segment.params.title;
            }
        });
    });

app.controller('controllers.app', function ($scope, $rootScope, $routeSegment, $routeParams) {
    'use strict';
    console.log("App controller started");
    $rootScope.segment = $routeSegment;
    $rootScope.params = $routeParams;
});
