// Secrets
var INSTAGRAM_ACCESS_TOKEN = '11419308.1677ed0.662b218eeb0544c79818fe3fb3267e45';
var MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiaGV5aXRzZ2FycmV0dCIsImEiOiIwdWt5ZlpjIn0.73b7Y47rgFnSD7QCNeS-zA';
// HTML entities
var activePhoto = document.getElementById('photo');
var input = document.getElementById('searchTerm');
var lightbox = document.getElementById('lightbox');
var photosContainer = document.getElementById('photos');
var navPrev = document.getElementById('prev-photo');
var navNext = document.getElementById('next-photo');
var instagramRequest = document.createElement('script');
// CONSTANTS
var CURRENT_PHOTO = 0;
var NUM_TO_SHOW = 18;
var PHOTOS = [];

// Init
input.value = 'mountains';
input.focus();
search(null,true);
document.addEventListener('keyup', handleShortcut, false);

// Search for photos in provided location
function search(e,triggerSearch) {
  // Listen for `enter` keypress
  if(triggerSearch || e.keyCode == 13) {
    var tag = input.value.replace(' ', '');
    var request = 'https://api.instagram.com/v1/tags/' + tag + '/media/recent?access_token=' + INSTAGRAM_ACCESS_TOKEN + '&callback=?';

    // Using jQuery here for CORS-fu and wanting to avoid wheel reinvention
    $.getJSON(request, function(data) {
      showPhotos(data);
    });

    return false;
  }
}

// Search Instagram for the given search term
function showPhotos(response) {
  PHOTOS = response.data;
  photosContainer.innerHTML = '';

  for (var i = 0; i < NUM_TO_SHOW; i++) {
    var tmp = PHOTOS[i];

    var item = document.createElement('a');
    item.setAttribute('data-num', i);
    item.setAttribute('href','#');
    item.className = 'grid-photo col4 pad1';
    item.addEventListener('click', function(e){
      // handle photo click
      showPhoto(this.getAttribute('data-num'));
      e.preventDefault();
    }, false);
    photosContainer.appendChild(item);

    // Now create and append to iDiv
    var photo = document.createElement('img');
    photo.src = PHOTOS[i].images.standard_resolution.url;

    item.appendChild(photo);

  }
}

// Bare-bones keyboard shortcuts
function handleShortcut(e) {
  if(document.body.className != 'lightbox') return;

  if(e.keyCode == 37 || e.keyCode == 74) {
    // left arrow, j
    traversePhoto(null,-1);
  } else if(e.keyCode == 75 || e.keyCode == 39) {
    // right arrow, k
    traversePhoto(null,1);
  } else if(e.keyCode == 27) {
    // escape
    closeLightbox();
  }
}

// Close lightbox
function closeLightbox() {
  document.body.className = '';
}

// Show single photograph in lightbox
function showPhoto(photoNum) {
  document.body.className = 'lightbox';
  activePhoto.src = PHOTOS[photoNum].images.standard_resolution.url;
  CURRENT_PHOTO = parseInt(photoNum);

  if(CURRENT_PHOTO == 0) {
    navPrev.className = navPrev.className + ' disabled';
  } else if(CURRENT_PHOTO == NUM_TO_SHOW - 1) {
    navNext.className = navNext.className + ' disabled';
  } else {
    navPrev.className = navPrev.className.replace(' disabled','');
    navNext.className = navNext.className.replace(' disabled','');
  }
}

// Called by nav onclick events, traverse current photo
function traversePhoto(event, direction) {
  if(event) { event.preventDefault(); }
  var newPhotoNum = parseInt(CURRENT_PHOTO + direction);

  if(newPhotoNum < 0 || newPhotoNum == NUM_TO_SHOW) {
    return false;
  } else {
    showPhoto(newPhotoNum);
  }
  CURRENT_PHOTO = newPhotoNum;
  return false;
}
