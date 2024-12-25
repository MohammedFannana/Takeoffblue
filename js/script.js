$(document).ready(function () {  
    new WOW().init();
    $("#js-rotating").Morphext({
        animation: "bounceIn",
        separator: ",",
        speed: 2000,
        complete: function () {
        }
    });

});