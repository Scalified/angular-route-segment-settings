var routingConfig = {
    routes: {
        home: {
            url: '/home',
            params: {
                default: true
            }
        },
        sections: {
            url: '/:section',
            params: {
                templateUrl: ViewsFactory,
                dependencies: ['section']
            },

            mapping: {
                routeParam: 'section',
                routeSettings: {
                    'section1': {templateUrl: 'views/section1.html'},
                    'section2': {templateUrl: 'views/section2.html'},
                    'section3': {templateUrl: 'views/section3.html'}
                }
            },
            routes: {
                paramsDependingRoute: {
                    url: "/:section/:topic/:subtopic?/:key?",
                    params: {
                        templateUrl: ViewsFactory,
                        dependencies: ['section', 'topic', 'subtopic', 'key']
                    },
                    mapping: {
                        routeParam: ['section', 'topic', 'subtopic?', 'key?'],
                        routeSettings: [
                            {
                                section: ['section1', 'section2'],
                                topic: ['topic1'],
                                templateUrl: 'views/section12.topic1.html'
                            },
                            {
                                section: ['section3'],
                                topic: ['topic1'],
                                key: ['key1'],
                                templateUrl: 'views/section3.topic1.key1.html'
                            },
                            {
                                section: ['section3'],
                                topic: ['topic1'],
                                templateUrl: 'views/section3.topic1.html'
                            },
                            {
                                topic: ['entities'],
                                templateUrl: 'app/views/docs/entity.html'
                            }
                        ]
                    }
                }
            }
        }
    }
};
