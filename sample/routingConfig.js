var routingConfig = {
    routes: {
        sections: {
            url: '/:section',
            params: {
                templateUrl: ViewsFactory,
                dependencies: ['section'],
                controller: 'controllers.sections'
            },

            mapping: {
                routeParam: 'section',
                routeSettings: {
                    'privateRest': {templateUrl: 'views/http/index.html'},
                    'publicRest': {templateUrl: 'views/http/index.html'},
                    'websocket': {templateUrl: 'views/websocket/index.html'}
                }
            },
            routes: {}
        }
    }
};
