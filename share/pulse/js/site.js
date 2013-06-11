$(document).ready(function() {

    // Overwrite Mapbox.js Marker styling

    mapbox.marker.style = function(f, latlon) {
        return L.marker(latlon, {
            icon: L.divIcon({className: 'simple-marker marker-' + f.properties.id + ' size-' + f.properties.count}),
            title: f.properties.title
        });
    };

    // ---------------------------------------------------------------------------
    // Global vars
    var locations = [],
        LIMIT = 50;

    // ---------------------------------------------------------------------------
    // Initialize map

    var map = mapbox.map('map', 'heyitsgarrett.map-5obxlq9h');
    var geocoder = mapbox.geocoder('heyitsgarrett.map-5obxlq9h');
    var gj = {
        type: 'FeatureCollection',
        features: []
    };
    var markerLayer = (new mapbox.markerLayer(gj)).addTo(map);

    map.attributionControl.addAttribution('Articles via <a href="http://nytimes.com">NYT APIs</a>');

    map._layersMinZoom = 2;

    // ---------------------------------------------------------------------------
    // Start er up
    fetchArticles();

    // ---------------------------------------------------------------------------
    // Functions

    function fetchArticles(offset) {
        if (offset === undefined)
            offset = 0;

        // Check localStorage for query (limiting the number of calls)
        // If it's within the last hour, don't run the API query again

        var cachedArticles = localStorage.getItem('articles');
        if(cachedArticles && offset === 0) {
            cachedArticles = JSON.parse(localStorage.getItem('articles'));

            var updated_date = new Date(cachedArticles.updated_date),
                current_date = new Date(),
                ONE_HOUR = 60 * 60 * 1000;

            if( (current_date - updated_date) < ONE_HOUR ) {
                return cleanData(cachedArticles);
            }
        }

        // Otherwise, if we need new data, run the query against NYTimes again

        $.ajax({
            dataType: 'jsonp',
            url: 'http://api.nytimes.com/svc/news/v3/content/all/world;u.s./.jsonp',
            async: false,
            data: {
                'api-key': '2a5af9cf2e0782c6eb4558b1d74ea8fa:2:51415825',
                'offset': offset,
                'limit': LIMIT
            },
            success: function(response) {
                var articles = [];

                response['updated_date'] = new Date().getTime();
                localStorage.setItem('articles',JSON.stringify(response));

                cleanData(response);
            }
        });
    }

    function cleanData(response) {
        var articles = [];
        // Clean data of articles without a location
        $.each(response.results, function(item) {
            var article = response.results[item],
                location = article.geo_facet[0];

            if(location) {
                articles.push(article);
            }

            if(item === response.results.length - 1) {
                createMarkers(articles);
            }
        });
    }

    function createMarkers(articles) {
        var $articles = $('#articles'),
            totalLength = articles.length - 1;

        $.each(articles, function(item) {
            var article = articles[item],
                location = article.geo_facet[0];

            // Clean up location
            location = location.replace(' (', ', ');
            location = location.replace(')', '');

            geocoder.query(location, function(err, res) {

                if (err || res === undefined) {
                    // Check in case this is the last element in the array, if so, add markers
                    if(item === totalLength ) {
                        addMarkers();
                    }
                    return;
                }

                // Add to sidebar
                var $li = $('<li data-country="' + location + '"><div class="article show-on-map">' +

                                '<strong class="title">' + article.title + '</strong>' +
                                '<p class="abstract">' + article.abstract + '</p>' +
                                '<a href="' + article.url + '" class="date" target="_blank">' + $.timeago(article.published_date) + ' in ' + location + '</a>' +

                            '</div></li>');

                $articles.append($li);

                var count = 1;

                if(locations[location.toString()] !== undefined) {
                    count = locations[location.toString()] + 1;
                }
                locations[location.toString()] = count;

                var articleTerm = count > 1 ? 'articles' : 'article';

                // Mapbox Geocode thinks Africa is in Pennsylvania. It is not.
                // Nor is England in Arkansas
                if(location === 'Africa') {
                    res.latlng[1] = 9.1021;
                    res.latlng[0] = 18.2812;
                } else if ( location === 'England') {
                    res.latlng[1] = 53.1142;
                    res.latlng[0] = -2.5771;
                }

                // Add marker
                gj.features.push({
                    type: 'Feature',
                    properties: {
                        'country': location,
                        'count': count,
                        'bounds': res.lbounds,
                        'title': count + ' ' + articleTerm + ' about ' + location
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [res.latlng[1], res.latlng[0]]
                    }
                });

                // Only add the geojson layer when everything is complete
                if(item === totalLength ) {
                    addMarkers();
                };
            });
        });

    }

    function addMarkers() {
        markerLayer.setGeoJSON(gj);
        $('a#load-articles').removeClass('loading');

        map.fitBounds(markerLayer.getBounds());
    }

    function cycleList(direction) {
        var $articles = $('#articles'),
            $active = $articles.find('li.active'),
            headerHeight = $('header').height();

        if($active.length) {
            if( direction === 'up') {
                // Select previous
                showArticle($active.prev());

            } else {
                // Select next
                showArticle($active.next());
            }
        } else {
            // Select first in list
            showArticle($articles.find('li:first-child'));
        }

        function showArticle($el) {
            $el.children('.show-on-map').trigger('click');

            // Pan to in sidebar
            if($el.position() !== undefined) {
                $('#articles-list').animate({
                    scrollTop: $('#articles-list').scrollTop() + $el.position().top
                }, 400);
            }

        }


    }

    // --------------------------------------------------------------------------------
    // Load more articles when bottom of list reached
    $('a#load-articles').on('click', function() {
        $(this).addClass('loading');

        var offset = $(this).data('offset') + LIMIT;
        fetchArticles(offset);

        $(this)
            .data('offset', offset + LIMIT);
    });


    // --------------------------------------------------------------------------------
    // Listen for map events
    map.on('click', function(e) {
        $('#articles > li').removeClass('active').show();
        $('a#load-articles').css('display','block');
        // Highlight markers
        markerLayer.filter(function(f) {
            return true;
        });
    });
    map.on('popupopen', function(e) {
        var marker = e.popup._source,
            prop = marker.feature.properties,
            coords = marker.feature.geometry.coordinates;

        $('#articles > li').hide();
        $('a#load-articles').hide();

        $('header #region').html('/ ' + prop.country);

        $('#articles > li').each(function(item, el){
            var $el = $(el);
            if($el.data('country') == prop.country) {
                $el.addClass('active');
                $el.show();
            }
        });

        $('#articles-list').animate({
            scrollTop: 0
        }, 250);

        map.panTo([coords[1],coords[0]]);
    });
    map.on('popupclose', function(e) {
        $('#articles > li').removeClass('active').show();
        $('a#load-articles').css('display','block');
        $('header #region').html('');
    });

    // --------------------------------------------------------------------------------
    // Listen for keyboard events
    $(document).bind('keydown','j',function(){
        cycleList('up');
    });
    $(document).bind('keydown','k',function(){
        cycleList('down');
    });

    // --------------------------------------------------------------------------------
    // On click of article in left pane, zoom to area on map,
    // highlight country, show tooltip

    $('#articles').on('click','.show-on-map',function(e){

        var $el = $(this),
            marker = gj.features[$el.parent().index()],
            geom = marker.geometry,
            prop = marker.properties,
            url = $el.find('.date').attr('href');

        // If it's already active, go to the url
        if($el.parent().hasClass('active')) {
            return window.open(url, '_blank');
        }

        $('#articles li').removeClass('active');
        $el.parent('li').addClass('active');

        // Highlight markers
        markerLayer.filter(function(f) {
            return f.properties['country'] === prop.country;
        });

        map.panTo([geom.coordinates[1],geom.coordinates[0]]);

        map.setZoom(4);

    });

});
