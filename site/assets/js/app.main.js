var $deviceContainer;
var $devices = [];

$(document).ready(function() {
    $deviceContainer = $(".site-content").masonry({
        columnWidth: 1,
        itemSelector: '.masonry-item'
    });
    
    if(localStorage && localStorage.getItem('devices')){
    addStoredDevices(JSON.parse(localStorage.getItem('devices')));
    } 
    
});

// option selection inside modals
$( ".modal-dialog .options" ).on( "click", ".btn-group .pure-button", function() {
    $(this).siblings(".pure-button").removeClass("button-selected");
    $(this).addClass("button-selected");
    console.log($(this).data("value"));
});


function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

// Bad code :-P
function appendIframe (settings) {
    // create new item elements
    var $items = generateIframe(settings);
    
    // append items to grid
    $deviceContainer.append( $items ).masonry( 'appended', $items );;
}

function generateIframe (settings) {
    // TODO :: Account for Chrome vs. No Chrome.  Right now it will get dimentions with chrome
    var dimensions = settings.screenOnly ?  _appConstants.screenDimensions : _appConstants.deviceDimensions; 
    var height = Math.round(dimensions[settings.device].height * (settings.scale / 100));
    var width = Math.round(dimensions[settings.device].width * (settings.scale / 100));

    if(settings.orientation === 'landscape') {
        var tmp = height;
        height = width;
        width = tmp;
    }

    // TODO :: Fix this.... bad bad bad code
    var iframeString = "<iframe id=\""+settings.deviceId+"\" class=\"device-container masonry-item\" src=\"https://appetize.io/embed/" + settings._apikey + "?" + settings.urlParams  + "\" width=\""+ width +"px\" height=\"" + height + "px\" frameborder=\"0\" scrolling=\"no\"></iframe>";
    
    console.log(iframeString);
    
    return iframeString;
}


function addStoredDevices (data){
    $.each(data, function( index, value ) {
        console.log( "restoring ...");
        console.log(value);
        
        appendIframe(value);
    });
    
}

function addDevice () {
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
    _settings['screenOnly'] = $("#addDeviceContainer .options div[data-model='screenOnly'] .button-selected").data("value");;
    
    _settings['urlParams'] = $.param(_settings['_options']);
    _settings['deviceId'] = generateUUID();
    
    // needs better handling of errors & even check if localStorage is available
    $devices.push(_settings);
    localStorage.setItem("devices", JSON.stringify($devices));
    
    
    appendIframe(_settings);
    
    console.log(_settings);
}

// Add device
$("#addDevice").on("click", function() {

    addDevice();

    $("#addDeviceContainer").modal("hide");    

});
