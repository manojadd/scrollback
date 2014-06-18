/* jshint browser: true */
/* global $, libsb, lace, currentState */

var $itemTmpl = $(".meta-conf .list-item");
var currentConfig;

$(".configure-button").on("click", function() {
    libsb.emit('navigate', { mode: "conf", source: "configure-button", room: window.currentState.roomName });
});

$(".conf-save").on("click", function() {
    var self = $(this);
    if(currentState.mode == 'conf') {
        self.addClass("working");
        libsb.emit('config-save', {id: window.currentState.roomName, description: '', identities: [], params: {}}, function(err, room) {
            var roomObj = {to: currentState.roomName, room: room};
            libsb.emit('room-up', roomObj, function(err, room) {
                var i;
                console.log("saved room", arguments);
                self.removeClass("working");
                if(err) {
                    // handle the error
                }else {
                    for(i in room.room.params) {
                        if(room.room.params[i].error) {
                            console.log("Error happed when saving the room");
                            return;
                        }
                    }
                    currentConfig = null;
                    $('.conf-area').empty();
                    libsb.emit('navigate', { mode: "normal", tab: "info", source: "conf-save" });
                }
            });
        });
    }
});

$(".conf-cancel").on("click", function() {
        currentConfig = null;
        // $('.settings-menu').empty();
        $('.conf-area').empty();
        libsb.emit('navigate', { mode: "normal", tab: "info", source: "conf-cancel" });
});


function showConfig(room){
        var sortable = []; // for sorting the config options based on priority
        /*libsb.getRooms({ref: currentState.roomName}, function(err, data){
           var room = data.results[0];*/
           var roomObj = {room: room};
            libsb.emit('config-show', roomObj, function(err, tabs) {
                    delete tabs.room;
                    
                    currentConfig = tabs;

                    $('.meta-conf').empty();
                    $('.conf-area').empty();
                    for(i in tabs) {
                            sortable.push([tabs[i].prio, i, tabs[i]]);
                    }
                    sortable.sort(function(a,b){
                            return b[0] - a[0];
                    });
                    sortable.forEach(function(tab){
                            var className = 'list-item-' + tab[1] + '-settings';
                            $('.' + className).remove();
                            $('.meta-conf').append('<a class="list-item ' + className + '">' + tab[2].text + '</a>');
                            $('.conf-area').append(tab[2].html);
                    });
                    // making general settings the default tab
                    $('.list-item-general-settings').addClass('current');
                    $('.list-view-general-settings').addClass('current');

             });
        /*});*/
}
function checkOwnerShip(){
    libsb.memberOf.forEach(function(room){
          if(room.id == currentState.roomName && room.role == "owner") isOwner = true;
    });
    if(isOwner === false){
          libsb.emit('navigate', {mode: 'normal'});
    }

}
libsb.on('navigate', function(state, next) {
        // check state.mode == settings
        var isOwner = false;
        if(state.mode === "conf"){
                // if currentConfig is blank, then
                if(libsb.isInited){
                    checkOwnerShip();
                }else{
                    libsb.on('inited', function(d, next){
                        checkOwnerShip();
                        next();
                    });
                }
                if(!currentConfig){
                    if(libsb.isInited){
                        showConfig(state.room);
                    }else{
                        libsb.on('inited', function(e, n){
                            showConfig(state.room);
                            if(n) n();
                        });
                    }
               }
        }
        next();
});
