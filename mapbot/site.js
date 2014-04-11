// CONSTANTS

var MAPID = 'examples.xqwfusor',
    HEIGHT = 400,
    WIDTH = 1200,
    CENTER = [0,0],
    ZOOM = 3,
    map;


$(document).ready(function () {

  var link = document.getElementById('output');

  // Prefill vals
  $('#mapid').val(MAPID);
  $('#width').val(WIDTH);
  $('#height').val(HEIGHT);

  resetMap();

  function resetMap() {

    $('#map').css({
      'width': WIDTH + 'px',
      'height': HEIGHT + 'px'
    });

    if(map) map.remove();

    map = L.mapbox.map('map', MAPID, {
        tileLayer: {
            detectRetina: true
        }
    });
    
    var hash = L.hash(map);

    map.whenReady(function(){
      map.setView(CENTER, ZOOM);
    });

    map.scrollWheelZoom.disable();
    map.addControl(L.mapbox.geocoderControl('examples.map-vyofok3q'));

  }



  map.on('moveend', function(e) {
    var new_center = map.getCenter();

    CENTER = [new_center.lat, new_center.lng];
    ZOOM = map.getZoom();
  });

  $('#mapid').blur(function(){
    val = $(this).val();
    if( val !== MAPID ) {
      MAPID = val;
      resetMap();
    }
  });


  $('#width').blur(function(){
    val = parseFloat($(this).val());

    if( val !== WIDTH ) {
      WIDTH = val;
      resetMap();
    }
  });

  $('#height').blur(function(){
    val = parseFloat($(this).val());

    if( val !== HEIGHT ) {
      HEIGHT = val;
      resetMap();
    }
  });


  link.addEventListener('click', function() {
    $('#output .text').addClass('hidden');
    $('#output .loading').removeClass('hidden');
    leafletImage(map, doImage);
  });

  function doImage(err, canvas) {

      // var img = document.createElement('img');
      // var dimensions = map.getSize();
      // img.width = dimensions.x;
      // img.height = dimensions.y;
      // img.src = canvas.toDataURL();
      // document.getElementById('images').innerHTML = '';
      // document.getElementById('images').appendChild(img);

      $('#output .text').removeClass('hidden');
      $('#output .loading').addClass('hidden');
      
      canvas.toBlob(function(blob) {
        saveAs(blob, MAPID + '.png');
      });
      
  }


});