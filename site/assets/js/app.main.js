// option selection inside modals
$( ".modal-dialog .options" ).on( "click", ".btn-group .pure-button", function() {
    $(this).siblings(".pure-button").removeClass("button-selected");
    $(this).addClass("button-selected");
    console.log($(this).data("value"));
});


// Bad code :-P
function appendIframe (settings) {
    $(".site-content").append(generateIframe(settings));
}

function generateIframe (settings) {
    // TODO :: Account for Chrome vs. No Chrome.  Right now it will get dimentions with chrome    
    var height = Math.round(_appConstants.deviceDimensions[settings.device].height * (settings.scale / 100));
    var width = Math.round(_appConstants.deviceDimensions[settings.device].width * (settings.scale / 100));

    if(settings.orientation === 'landscape') {
        var tmp = height;
        height = width;
        width = tmp;
    }

    // TODO :: Fix this.... bad bad bad code
    var iframeString = "<div class=\"device-container masonry-item\">";
    iframeString += "<iframe src=\"https://appetize.io/embed/" + settings._apikey + "?" + settings.urlParams  + "\" width=\""+ width +"px\" height=\"" + height + "px\" frameborder=\"0\" scrolling=\"no\"></iframe>";
    iframeString +="</div>";
    
    console.log(iframeString);
    
    return iframeString;
}


// Add device
$("#addDevice").on("click", function() {
    var _settings = { '_options': [] };
    //replace this with dynamic api
    _settings['_apikey'] = 'bp8h41ey07qv3wp2hfy7vh9wn4';
    
    $("#addDeviceContainer .options .button-selected").each(function(index, element) {
        var _obj = {};
        var _key = $(element).parent().data("model");
        var _value = $(element).data("value");
        
        _obj['name'] = _key;
        _obj['value'] = _value;
        _settings['_options'].push(_obj);
    });
    
    _settings['device'] = $("#addDeviceContainer .options div[data-model='device'] .button-selected").data("value");
    _settings['scale'] = $("#addDeviceContainer .options div[data-model='scale'] .button-selected").data("value");
    _settings['orientation'] = $("#addDeviceContainer .options div[data-model='orientation'] .button-selected").data("value");
    
    _settings['urlParams'] = $.param(_settings['_options']);
    
    
    appendIframe(_settings);
    
    
    
    $(".site-content").masonry({
        columnWidth: 200,
	   itemSelector: '.masonry-item'
    });
    
    console.log(_settings);

    $("#addDeviceContainer").modal("hide");    

});
