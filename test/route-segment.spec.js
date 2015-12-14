'use strict';

describe('route segment', function () {

    var $routeSegment, $routingSettingsProvider, $routeSegmentProvider, $rootScope, $httpBackend, $location, $provide;
    var callback;

    //SETUP
    beforeEach(function () {
        jasmine.addMatchers(window.customMatchers);
        if (angular.version.major > 1 || angular.version.minor >= 2) {
            module('ngRoute');
        }
        module('route-segment');
        module('route-segment-settings');

    });

    beforeEach(module(function (_$routeSegmentProvider_, _$routingSettingsProvider_, _$provide_) {

        $provide = _$provide_;

        $routeSegmentProvider = _$routeSegmentProvider_;
        $routingSettingsProvider = _$routingSettingsProvider_;

        var routingConfig = {
            routes: {
                'section-first': {
                    url: '/1',
                    params: {test: 'A'}
                },
                section2: {
                    url: '/2',
                    params: {test: 'B'},
                    routes: {
                        section21: {
                            url: '/2/X',
                            params: {test: 'C'},
                            routes: {
                                section211: {
                                    url: '/X-foo',
                                    params: {test: 'E'}
                                }
                            }
                        },
                        section22: {
                            url: '/Y',
                            params: {test: 'D'}
                        },
                        section23: {
                            url: '/2/:id',
                            params: {test: 'F'},
                            routes: {
                                section231: {
                                    url: '/2/:id/bar',
                                    params: {test: 'G'}
                                }
                            }
                        }

                    }
                },
                foo: {
                    url: '/foo',
                    routes: {
                        bar: {
                            url: '/foo/:param*/bar'
                        },
                        optionalBar: {
                            url: '/foo/:param?/bar'
                        }
                    }
                }
            }
        };

        $routingSettingsProvider.configure(routingConfig);
        $routeSegmentProvider.options.autoLoadTemplates = false;    // We don't want to perform any XHRs here
        $routeSegmentProvider.options.strictMode = true;
    }));

    beforeEach(function () {
        inject(function (_$routeSegment_, _$rootScope_, _$httpBackend_, _$location_) {
            $routeSegment = _$routeSegment_;
            $rootScope = _$rootScope_;
            $httpBackend = _$httpBackend_;
            $location = _$location_;
        });

        callback = jasmine.createSpy('callback');
        $rootScope.$on('routeSegmentChange', callback);
    });

    it('creating segments hash', function () {

        var segments = $routeSegmentProvider.segments;
        expect(segments.sectionFirst.params.test).toBe('A');
        expect(segments.sectionFirst.children).toBeUndefined();
        expect(segments.section2.params.test).toBe('B');
        expect(segments.section2.children.section21.params.test).toBe('C');
        expect(segments.section2.children.section22.params.test).toBe('D');
        expect(segments.section2.children.section22.children).toBeUndefined();
        expect(segments.section2.children.section21.children.section211.params.test).toBe('E');
    });

    describe('routing', function () {

        it('first level', function () {
            $location.path('/1');

            $rootScope.$digest();
            expect(callback.calls.count()).toBe(1);
            expect(callback.calls.argsFor(0)[1]).toEqual({
                index: 0, segment: {
                    name: 'section-first', params: {test: 'A'}, locals: {}, reload: jasmine.any(Function)
                }
            });
        });

        it('second level', function () {
            $location.path('/2/X');

            $rootScope.$digest();
            expect(callback.calls.count()).toBe(2);
            expect(callback.calls.argsFor(0)[1]).toEqual({
                index: 0, segment: {
                    name: 'section2', params: {test: 'B'}, locals: {}, reload: jasmine.any(Function)
                }
            });
            expect(callback.calls.argsFor(1)[1]).toEqual({
                index: 1, segment: {
                    name: 'section21', params: {test: 'C'}, locals: {}, reload: jasmine.any(Function)
                }
            });
        });

        it('second level segment with first level url', function () {
            $location.path('/Y');

            $rootScope.$digest();
            expect(callback.calls.count()).toBe(2);
            expect(callback.calls.argsFor(0)[1]).toEqual({
                index: 0, segment: {
                    name: 'section2', params: {test: 'B'}, locals: {}, reload: jasmine.any(Function)
                }
            });
            expect(callback.calls.argsFor(1)[1]).toEqual({
                index: 1, segment: {
                    name: 'section22', params: {test: 'D'}, locals: {}, reload: jasmine.any(Function)
                }
            });
        });

        it('third level', function () {
            $location.path('/X-foo');

            $rootScope.$digest();
            expect(callback.calls.count()).toBe(3);
            expect(callback.calls.argsFor(0)[1]).toEqual({
                index: 0, segment: {
                    name: 'section2', params: {test: 'B'}, locals: {}, reload: jasmine.any(Function)
                }
            });
            expect(callback.calls.argsFor(1)[1]).toEqual({
                index: 1, segment: {
                    name: 'section21', params: {test: 'C'}, locals: {}, reload: jasmine.any(Function)
                }
            });
            expect(callback.calls.argsFor(2)[1]).toEqual({
                index: 2, segment: {
                    name: 'section211', params: {test: 'E'}, locals: {}, reload: jasmine.any(Function)
                }
            });
        });

        it('a route with no segment', function () {
            $rootScope.$broadcast('$routeChangeSuccess', {$$route: {}});
            $rootScope.$digest();
            expect(callback).not.toHaveBeenCalled();
        });

        it('should go down to a child after going to a parent', function () {

            $location.path('/2');
            $rootScope.$digest();

            callback = jasmine.createSpy('event');
            $rootScope.$on('routeSegmentChange', callback);

            $location.path('/2/X');

            $rootScope.$digest();
            expect(callback.calls.count()).toBe(1);
            expect(callback.calls.argsFor(0)[1]).toEqual({
                index: 1, segment: {
                    name: 'section21', params: {test: 'C'}, locals: {}, reload: jasmine.any(Function)
                }
            });
        });

        it('should go up to parent after going to a child, sending null for previously loaded child segment', function () {

            $location.path('/2/X');

            $rootScope.$digest();
            callback = jasmine.createSpy('event');
            $rootScope.$on('routeSegmentChange', callback);

            $location.path('/2');

            $rootScope.$digest();
            expect(callback.calls.count()).toBe(1);
            expect(callback.calls.argsFor(0)[1]).toEqual({index: 1, segment: null});
            expect($routeSegment.chain.length).toBe(1);
            expect($routeSegment.chain[0].name).toBe('section2');
        });
    });

    describe('reverse routes', function () {

        it('should get simple reverse route without params', function () {
            var url = $routeSegment.getSegmentUrl('section-first');
            expect(url).toBe('/1');
        });

        it('should get 2nd level route without params', function () {
            var url = $routeSegment.getSegmentUrl('section2.section21');
            expect(url).toBe('/2/X');
        });

        it('should get a route with the specified params', function () {
            var url = $routeSegment.getSegmentUrl('section2.section23', {id: 'TEST'});
            expect(url).toBe('/2/TEST');
        });

        it('should get a route with param using * mark', function () {
            var url = $routeSegment.getSegmentUrl('foo.bar', {param: 'TEST'});
            expect(url).toBe('/foo/TEST/bar');
        });

        it('should get a route with an optional param using ? mark', function () {
            var url = $routeSegment.getSegmentUrl('foo.optionalBar', {param: 'TEST'});
            expect(url).toBe('/foo/TEST/bar');

            url = $routeSegment.getSegmentUrl('foo.optionalBar', {});
            expect(url).toBe('/foo/bar');
        });

        it('should throw an error for unknown segment', function () {
            expect(function () {
                $routeSegment.getSegmentUrl('unknown-segment');
            }).toThrow();
        });

        it('should throw an error when required params not specified', function () {
            expect(function () {
                $routeSegment.getSegmentUrl('section2.section23');
            }).toThrow();
        });
    });

    describe('filters', function () {

        it('routeSegmentEqualsTo', inject(function ($filter) {
            $location.path('/1');
            $rootScope.$digest();
            expect($filter('routeSegmentEqualsTo')('section-first')).toBe(true);

            $location.path('/2/X');
            $rootScope.$digest();
            expect($filter('routeSegmentEqualsTo')('section-first')).toBe(false);
            expect($filter('routeSegmentEqualsTo')('section2.section21')).toBe(true);
        }));

        it('routeSegmentEqualsTo', inject(function ($filter) {
            $location.path('/2/X');
            $rootScope.$digest();
            expect($filter('routeSegmentStartsWith')('section-first')).toBe(false);
            expect($filter('routeSegmentStartsWith')('section2')).toBe(true);
            expect($filter('routeSegmentStartsWith')('section2.section21')).toBe(true);
        }));

        it('routeSegmentEqualsTo', inject(function ($filter) {
            $location.path('/2/X');
            $rootScope.$digest();
            expect($filter('routeSegmentContains')('section-first')).toBe(false);
            expect($filter('routeSegmentContains')('section2')).toBe(true);
            expect($filter('routeSegmentContains')('section21')).toBe(true);
        }));
    });
});