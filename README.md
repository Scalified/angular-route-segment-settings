# angular-route-segment-settings 

Extension for [angular-route-segment](https://github.com/artch/angular-route-segment) routing library.
Provides simplified routes declaration, dynamic route settings(template, controller) depending on route parameters.

Getting Started
-------

You can install the library via [Bower](http://bower.io/):
```
bower install angular-route-segment-settings
```

Simple example of usage can be found in the folder
[/sample](https://github.com/sqrter/angular-route-segment-settings/tree/master/sample).

Overview
--------

This $provider is intended to simplify the process of nested routes declaration using a great library called
[angular-route-segment](https://github.com/artch/angular-route-segment)

Here is an example of routing configuration using angular-route-segment:

```javascript
app.config(function ($routeSegmentProvider) {

$routeSegmentProvider.

    when('/section1',          's1').
    when('/section1/prefs',    's1.prefs').
    when('/section1/:id',      's1.itemInfo').
    when('/section1/:id/edit', 's1.itemInfo.edit').
    when('/section2',          's2').
    when('/section22',          's2').

    segment('s1', {
        templateUrl: 'templates/section1.html',
        controller: MainCtrl}).

    within().

        segment('home', {
            default: true,
            templateUrl: 'templates/section1/home.html'}).

        segment('itemInfo', {
            templateUrl: 'templates/section1/item.html',
            controller: Section1ItemCtrl,
            dependencies: ['id']}).

        within().

            segment('overview', {
                default: true,
                templateUrl: 'templates/section1/item/overview.html'}).

            segment('edit', {
                 templateUrl: 'templates/section1/item/edit.html'}).

        up().

        segment('prefs', {
            templateUrl: 'templates/section1/prefs.html'}).

    up().

    segment('s2', {
        templateUrl: 'templates/section2.html',
        controller: MainCtrl});
});
```

It looks quite simple to understand, however, in case when there are hundreds of routes it would be nice to simplify
the syntax. Firstly, we don't want to split `when` declarations and `segment` statements. It's really inconvenient to
have them segregated. Second motivation is to get rid of repetitive `within()` and `up()` calls, and use some object
oriented approach to denote the nesting. Let's look at this:

```javascript
app.config(function ($routingSettingsProvider) {
    $routingSettingsProvider.configure(routingConfig);
});
```

It's easier not to overfill app.config() logic since routingConfig may be just an object:

```javascript
var routingConfig = {
    routes: {
        s1: {
            url: '/section1',
            params: {
                templateUrl: 'templates/section1.html',
                controller: MainCtrl
            },
            routes: {
                home: {
                    params: { default: true, templateUrl: 'templates/section1/home.html'}
                },
                itemInfo: {
                    url: '/section1/:id',
                    params: {
                        templateUrl: 'templates/section1/item.html',
                        controller: Section1ItemCtrl,
                        dependencies: ['id']
                    },
                    routes: {
                        overview: {
                            params: {default: true, templateUrl: 'templates/section1/item/overview.html'}
                        },
                        edit: {
                            url: '/section1/:id/edit',
                            params: { templateUrl: 'templates/section1/item/edit.html'}
                        }
                    }
                },
                prefs: {
                    url: '/section1/prefs',
                    params: {templateUrl: 'templates/section1/prefs.html'}
                }
            }
        },
        s2: {
            url: ['/section2', '/section22'],
            params: {templateUrl: 'templates/section2.html', controller: MainCtrl}
        }
    }
}
```

So what we have now:

- each segment is configured via object, containing properties `url`, `params`
- any segment can contain child segments inside `routes` property
- params object interface is the same as original, so it supports original angular-route-segment functionality

Additional functionality
--------
Sometimes it's needed to have a single segment, but to choose its template depending on some url parameter(s).
It can be done using `mapping` functionality. Here's an simple usage example:

```javascript
    sections: {
        url: 'sections/:type',
        params: {
            templateUrl: function($routingSettings) {
                             return $routingSettings.getMappedValue('templateUrl');
                         },
            dependencies: ['type']
        },

        mapping: {
            routeParam: 'type',
            routeSettings: {
                'section1': {templateUrl: 'views/section1.html'},
                'section2': {templateUrl: 'views/section2.html'},
                'section3': {templateUrl: 'views/section3.html'}
            }
        },
```

There is also a bit more complex case, when there are multiply parameters that must be considered when selecting
template. For example, lets assume that we have documentation site with 3 sections: internalRest, externalRest,
websockets. Each section has set of operations to describe. Both rest sections have the same view(template) for
operation description page. But operations from websockets section have different view(template).
In addition there are a lot of entities(DTOs) within every section. Every entity has the same template,
without regard to section.

Here is an example of how it can be configured using angular-route-segment-settings:

```javascript
    viewInfo: {
        //section - internalRest, externalRest, websockets
        //kind - operation, entity
        //key - * (any key)
        url: '/docs/:section/:kind/:key',
        params: {
            //ViewsFactory is global variable, look at previous example
            templateUrl: ViewsFactory,
            controller: 'controllers.viewInfo',
            dependencies: ['section', 'kind', 'key']
        },
        mapping: {
            routeParam: ['section', 'kind', 'key'],
            //Note, that order matters here. First setting has most priority, last one - lower priority.
            routeSettings: [
                //if it's one of rest sections & operation page - choose restOperation.html template
                {
                    section: ['internalRest', 'externalRest'],
                    kind: ['operations'],
                    templateUrl: 'app/views/restOperation.html'
                },
                //if it's websockets section & current operation is 'connect' - choose restOperation.html
                //This is so because 'connect' here is http based handshake request, therefore it has the same template
                //as another rest operations.
                {
                    section: ['websockets'],
                    kind: ['operations'],
                    key: ['connect'],
                    templateUrl: 'app/views/restOperation.html'
                },
                //if it's websockets section & operation page - choose wsOperation template
                {
                    section: ['websockets'],
                    kind: ['operations'],
                    templateUrl: 'app/views/wsOperation.html'
                },
                //entities are the same everywhere, so use entity.html when kind == 'entity'
                {
                    kind: ['entities'],
                    templateUrl: 'app/views/entity.html'
                }
            ]
        }
    }
}
```

License
-------

The MIT License (MIT)

Copyright (c) 2016 Sergey Siryk

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.