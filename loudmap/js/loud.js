// Global vars
var VIDEOID, MAPID;

// Get URL params
function getParam(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}

VIDEOID = getParam('v');
MAPID = getParam('m');
TEXT = getParam('t');
START = parseInt(getParam('s'), 10) || 0;
END = parseInt(getParam('e'), 10) || null;

// Misc Functions

function parseYoutubeId(url) {
    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match&&match[2].length==11){
        return match[2];
    }else{
        return false;
    }
}

function showError(error) {
    console.log(error);
    $('#message').text('Error loading sound. SILENTGIF!').show();
}

// Youtube Embed Code

var player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        videoId: VIDEOID,
        playerVars: {
            'autoplay': 1,
            'controls': 0,
            'end': END,
            'modestbranding': 1,
            'playlist': VIDEOID,
            'showinfo': 0,
            'start': START,
            'loop': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onError': onPlayerError,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    console.log('hello');
}

function onPlayerError(event) {
    // console.log('damn')
    showError('Couldn\'t load sound. SILENTGIF!');
}

function onPlayerStateChange(event) {
}

$(document).ready(function() {

    // Return defaults
    // TODO: Make this intro page instead
    if (VIDEOID === 'null') {
        VIDEOID = '5NV6Rdv1a3I';
    } else {
        $('#loudvideo').val(unescape('http://www.youtube.com/watch?v=' + VIDEOID));
    }

    if (MAPID === 'null') {
        MAPID = 'heyitsgarrett.h42o59f2';
    } else {
        $('#loudmapid').val(MAPID);
    }

    if (START === 'null') {
        START = 0;
    }

    var map = L.mapbox.map('map', MAPID)
        .setView([40, -74.50], 9);

    map.scrollWheelZoom.disable();

    var hash = L.hash(map);

    if (END === 'null') {
        END = 0;
    }

    // Start loading

    // Init clipboard object
    ZeroClipboard.setDefaults( {
        moviePath: '/js/zeroclipboard/ZeroClipboard.swf',
        hoverClass: 'copy-is-hover',
        activeClass: 'copy-is-active'
    });

    var clip = new ZeroClipboard($(".copy"));

    clip.on( 'complete', function(client, args) {
        $('.copy').html('COPIED!');
    } );

    if (VIDEOID !== 'null') {
        // Init YouTube Video
        var tag = document.createElement('script');

        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    }

    if (TEXT !== 'null') {
        $('#message').text(TEXT).show();
    }

    // -------------------------------------------------------------------------------------
    // Events

    var URL_INITED = false,
        ANIM_SPEED = 300,       // milliseconds
        OFFSCREEN_HEIGHT = 60,  // percentage
        windowWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width,
        $info = $('#info'),
        $meta = $('#meta'),
        $wrapper = $('#wrapper');

    $("input[type=text]").click(function() {
        $(this).select();
    });

    // Modal ex button
    $('.modal .ex').on('click',function(){
        $('.modal').animate({
            top: '-100%'
        }, ANIM_SPEED);
    })

    // Information section
    $('.show-screen').on('click',function(){
        if($meta.hasClass('active')) {
            toggleScreen('off');
        } else {
            toggleScreen('on');
        }
        return false;
    });

    // Share button
    $('#share').on('click',function(){
        if(URL_INITED == false) {

            var bitlyUrl = document.URL;

            if(bitlyUrl !== undefined) {
                $('#share-url-to-copy').html(bitlyUrl);
            } else {
                $('#share-url-to-copy').html('http://loudgif.com');
            }

            // Show modal
            $('.modal').animate({
                top: '25%'
            }, ANIM_SPEED);

            URL_INITED = true;
        
        } else {
            // Show modal
            $('.modal').animate({
                top: '25%'
            }, ANIM_SPEED);
        }

    });

    $('#wrapper').on('click',function(){
        toggleScreen('off');
    });

    $('#toggle-video').on('click',function() {
        if($(this).data('playing') === true) {
            player.pauseVideo();
            $(this)
                .removeClass('icon-sound')
                .addClass('icon-mute')
                .data('playing',false);

        } else {
            player.playVideo();
            $(this)
                .addClass('icon-sound')
                .removeClass('icon-mute')
                .data('playing',true);
        }
    });

    $(window).scroll(function (e) {
        if($(this).scrollTop() > 0) {
            $meta.addClass('active');

            // Distance from gif = quieter
            if(player) {

                var wintop = $(window).scrollTop(),
                    docheight = $(document).height(),
                    winheight = $(window).height();


                var volume = 100 - ((wintop/(docheight-winheight))*100);
                if(volume < 30) { volume = 30; }
                player.setVolume(volume);
            }

        } else {
            $meta.removeClass('active');
        }
    });

    // Debug init
    if(getParam('sc') !== 'null') {
        toggleScreen('on');
    }

    function toggleScreen(direction) {
        if(direction === 'on') {
            $('html, body').animate({
                scrollTop: (OFFSCREEN_HEIGHT / 100) * $info.offset().top
            }, ANIM_SPEED);
            return $meta.addClass('active');
        } else {
            $('html, body').animate({
                scrollTop: 0
            }, ANIM_SPEED);
            return $meta.removeClass('active');
        }
    }

    // Reset form
    $('#another').on('click', function(){
        $('#created').fadeOut(ANIM_SPEED, function(){
            $('#newLoudmap').fadeIn(ANIM_SPEED);
        });
        $('#newLoudmap .field input').val('');
        $('#loudstart').val(0);
    });

    // Validate form
    $("#newLoudmap").validate({
        rules: {
            loudmapid: {
                required: true
            },
            loudvideo: {
                required: true,
                url: true
            },
            loudstart: {
                required: true,
                maxlength: 5
            },
            loudtext: {
                required: false,
                maxlength: 200
            }
        },
        messages: {
            loudmapid: {
                required: 'Need map ID here, friend',
                url: 'This has to be a URL. You know, HTTP:// and so on and so forth.'
            },
            loudvideo: {
                required: 'What\'s a loudmap without sound?',
                url: 'This has to be a URL'
            },
            loudstart: {
                required: '',
                maxlength: ''
            },
            loudtext: {
                required: false,
                maxlength: 'Sorry, we cut you off at 200 characters'
            }
        },
        submitHandler: function(form) {
            var $submit = $('#submit'),
                loudgif = {
                mapid:    escape($('#loudmapid').val()),
                video:  parseYoutubeId($('#loudvideo').val()),
                start:  parseInt($('#loudstart').val()),
                text:   escape($('#loudtext').val())
            };

            // Make submit loading style
            var submitText = $submit.val();
            $submit.addClass('loading').html('LOUDGIFIN\'');

            // Build string
            var loudgif_url = 'http://heyitsgarrett.com/loudmap/?m=' + loudgif.mapid + '&v=' + loudgif.video;

            if(loudgif.text !== '') {
                loudgif_url += '&t=' + loudgif.text;
            }
            if(loudgif.start > 0) {
                loudgif_url += '&s=' + loudgif.start;
            }


            $submit.val(submitText).removeClass('loading');
            $('#copy-loudgif').html('COPY!');

            window.location = loudgif_url;

            return false;
        }
    });


});
