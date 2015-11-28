/**
 * angular-route-segment-settings 0.0.1
 * https://angular-route-segment.com
 * @author Sergey Siryk
 * @license MIT License http://opensource.org/licenses/MIT
 */
'use strict';

(function (angular) {
    var mod = angular.module('route-segment-settings', ['route-segment']);
    mod.provider('$routingSettings',
        ['$routeProvider', '$routeSegmentProvider', function ($routeProvider, $routeSegmentProvider) {
            this.configure = function (conf) {
                this.config = conf;
                var service = new RoutingInitializationService($routeSegmentProvider, $routeProvider);
                service.initRoutes(this.config);
            };

            function RoutingInitializationService($routeSegmentProvider, $routeProvider) {
                var routeSegmentProvider, routeProvider,
                    utilityProperties = ['url', 'params', 'routes', 'mapping'];

                var self = this;

                if ($routeSegmentProvider) {
                    routeSegmentProvider = $routeSegmentProvider;
                } else {
                    throw new Error('Invalid $routeSegmentProvider parameter');
                }
                if ($routeProvider) {
                    routeProvider = $routeProvider;
                } else {
                    throw new Error('Invalid $routeProvider parameter');
                }


                self.initRoutes = function (settings, current, parent) {
                    if (typeof (settings) === 'object') {
                        for (var settingsProp in settings) {
                            if (typeof (settings[settingsProp]) === 'object') {
                                if (settingsProp === 'routes') {
                                    self.initRoutes(settings[settingsProp], current, settings);
                                }
                                if (!self.isUtilityProperty(settingsProp)) {
                                    var compositeSegmentsPath = current ? current + '.' + settingsProp : settingsProp;
                                    if (settings[settingsProp].params && settings[settingsProp].params.default) {
                                        delete settings[settingsProp].params.default;
                                        routeProvider.when(parent.url, {redirectTo: settings[settingsProp].url});
                                    }
                                    self.initSegment(settingsProp, settings[settingsProp], compositeSegmentsPath);

                                    if (typeof (settings[settingsProp].routes) === 'object') {
                                        self.initRoutes(settings[settingsProp], compositeSegmentsPath, settings);
                                    }
                                }
                            }
                        }
                    }
                };

                self.isUtilityProperty = function (propertyName) {
                    for (var i = 0; i < utilityProperties.length; i++) {
                        if (propertyName === utilityProperties[i]) {
                            return true;
                        }
                    }
                    return false;
                };

                self.initSegment = function (segmentKey, segmentObj, segmentPath) {
                    var config = self.mapUrlToSegment(segmentObj.url, segmentPath);
                    var parentSegments = segmentPath.replace(segmentKey, '').split('.');
                    for (var i = 0; i < parentSegments.length; i++) {
                        if (parentSegments[i]) {
                            config = config.within(parentSegments[i]);
                        }
                    }
                    config.segment(segmentKey, segmentObj.params || {});
                };

                self.mapUrlToSegment = function (url, segment) {
                    var config = null, urls = [];
                    if (angular.isArray(url)) {
                        urls = url;
                    } else if (typeof (url) === 'string') {
                        urls.push(url);
                    }
                    for (var i = 0; i < urls.length; i++) {
                        config = routeSegmentProvider.when(urls[i], segment);
                    }
                    return config;
                };

            }

            function RoutingSettingsService($route, config) {
                var self = this;

                self.getRouteSegmentConfig = function (segmentName) {
                    var segmentsChain = segmentName.split('.');
                    if (angular.isArray(segmentsChain)) {
                        var configPathChain = [];
                        for (var i = 0; i < segmentsChain.length; i++) {
                            configPathChain.push('routes');
                            configPathChain.push(segmentsChain[i]);
                        }
                        var segmentConfig;
                        for (var j = 0; j < configPathChain.length; j++) {
                            segmentConfig = !segmentConfig ? config[configPathChain[j]] : segmentConfig[configPathChain[j]];
                        }
                        return segmentConfig;
                    }
                    return undefined;
                };

                function getParamFromRoute(param) {
                    var result = $route.current.params[param];
                    if (result) {
                        return result;
                    } else {
                        throw new Error('Route mapping configuration for segment=' +
                            $route.current.$$route.segment + ' expects routeParam=' + param +
                            ' , but it does\'nt exists in current query string');
                    }
                }

                function getParamsFromRoute(params) {
                    var result = {};
                    for (var index in params) {
                        result[params[index]] = getParamFromRoute(params[index]);
                    }
                    return result;

                }

                self.getMappedValue = function (configParameter, segment) {
                    var currentSegment = segment || $route.current.$$route.segment;
                    var routeSegmentConfig = self.getRouteSegmentConfig(currentSegment);
                    if (routeSegmentConfig) {
                        var mapBy = routeSegmentConfig.mapping.routeParam;
                        if (angular.isArray(mapBy)) {
                            var paramsValues = getParamsFromRoute(mapBy);
                            var routeSettings = routeSegmentConfig.mapping.routeSettings;
                            if (!angular.isArray(routeSettings)) {
                                throw new Error('Route mapping configuration for segment=' + currentSegment +
                                    ' expects routeParams property to be an array.');
                            }
                            for (var index in routeSettings) {
                                var mapping = routeSettings[index];
                                var match = true;
                                for (var paramKey in paramsValues) {
                                    match = (!mapping[paramKey] || mapping[paramKey].indexOf(paramsValues[paramKey]) > -1) && match;
                                    if (!match) break;
                                }
                                if (match) {

                                    if (mapping[configParameter]) {
                                        return mapping[configParameter];
                                    } else {
                                        throw new Error('Cant find mapping configuration for segment=' +
                                            currentSegment + ', routeParam=' + mapBy +
                                            ', routeParamValues=' + paramsValues);
                                    }
                                }
                            }

                        } else {
                            var mappingParameterValue = getParamFromRoute(mapBy);
                            var routeMappingSettings = routeSegmentConfig.mapping.routeSettings[mappingParameterValue];
                            if (routeMappingSettings && routeMappingSettings[configParameter]) {
                                return routeMappingSettings[configParameter];
                            } else {
                                throw new Error('Cant find mapping configuration for segment=' + currentSegment +
                                    ', routeParam=' + mapBy + ', routeParamValue=' + mappingParameterValue);
                            }
                        }

                    } else {
                        throw new Error('Cant find configuration for segment=' + currentSegment);
                    }

                };

            }

            this.$get = ['$route', function ($route) {
                return new RoutingSettingsService($route, this.config);
            }];
        }]);
})(angular);