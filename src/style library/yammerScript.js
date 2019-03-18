/* Created from Chrome SP Editor */
$(window).on('load', function () {
    SP.SOD.executeOrDelayUntilEventNotified(function () {
        setTimeout(function(){
            yam.platform.yammerShare();
        },1000);
    }, "sp.bodyloaded");
});