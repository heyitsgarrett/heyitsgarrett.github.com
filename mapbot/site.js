// CONSTANTS

var MAPID = 'examples.xqwfusor',
    HEIGHT = 500,
    WIDTH = 1000,
    map;


$(document).ready(function () {

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

    map.scrollWheelZoom.disable();

  }

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


  document.getElementById('output').addEventListener('click', function() {
      leafletImage(map, doImage);
  });

  // window.setTimeout(function() {
  //     map.panBy([100, 100]);
  //     // map.setView([0, 0], 2);
  //     window.setTimeout(function() {
  //         leafletImage(map, doImage);
  //     }, 1000);
  // }, 1000);

  function doImage(err, canvas) {
      var img = document.createElement('img');
      var dimensions = map.getSize();
      img.width = dimensions.x;
      img.height = dimensions.y;
      img.src = canvas.toDataURL();
      document.getElementById('images').innerHTML = '';
      document.getElementById('images').appendChild(img);


      console.log('test');
      // window.setTimeout(function() {
      //   var link = document.getElementById('output');
      //   link.href = img.src;
      //   link.download = MAPID + '.png';
      // }, 1000);
      
  }


});