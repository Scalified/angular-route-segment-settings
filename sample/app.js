var app = angular.module('app', ['ngRoute', 'route-segment', 'view-segment', 'route-segment-settings'])
    .config(function ($routeProvider, $routeSegmentProvider, $httpProvider, $routingSettingsProvider) {
        'use strict';

        $routeSegmentProvider.options.autoLoadTemplates = true;
        $routingSettingsProvider.configure(routingConfig);
        $routeProvider
            .otherwise({redirectTo: '/'});
    })
    .run(function ($rootScope) {
        'use strict';
        $rootScope.$on('routeSegmentChange', function (event, route) {
            if (route.segment) {
                $rootScope.title = route.segment.params.title;
            }
        });
    });

app.controller('controllers.sections', function ($scope, $routeParams) {
    'use strict';
    var testData = function (section) {
        switch (section) {
            case 'privateRest':
                return [{name: "getLogs", method: "GET"}];
            case 'publicRest':
                return [{name: "helloWorld", method: "POST"}];
            case 'websocket':
                return [{name: "connect", type: "HTTP Request"}, {name: "subscribe", type: "WSRequest"}];
        }
    };

    $scope.data = testData($routeParams.section);
});
