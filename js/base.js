$(document).ready(function() {

	var konami_keys = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
	var konami_index = 0;
	$(document).keydown(function(e){
	if(e.keyCode === konami_keys[konami_index++]){
	    if(konami_index === konami_keys.length){
	        $(document).unbind('keydown', arguments.callee);
	        
	        $('#container').fadeTo('slow', 0.3, function() {
				$(this).css("background-image","url(http://i.imgur.com/nB6ZC.gif)");
				$(this).find('.description span').html('you');
			}).fadeTo('slow', 1);

	    }
	}else{
	    konami_index = 0;
	}
	});

});