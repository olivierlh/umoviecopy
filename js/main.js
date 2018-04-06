requirejs.config({
    paths: {
        "backbone": "../lib/backbone",
        "underscore": "../lib/underscore",
        "jquery": "../lib/jquery",
        "backbone.marionette": "../lib/backbone.marionette",
        "backbone.radio": "../lib/backbone.radio",
        "bootstrap": "../lib/bootstrap",
        "waves": "../lib/waves",
        "text": "../lib/text",
        "imgToSvg": "../lib/imgToSvg",
        "hammer": "../lib/hammer",
        "slideMenu": "../lib/slideMenu",
        "caroussel": "../lib/caroussel",
        "bootpag" : "../lib/jquery.bootpag",
        "md5" : "../lib/MD5"
    },
    shim: {
        bootstrap: {
            deps: ["jquery"]
        },
        imgToSvg: {
            deps: ["jquery"]
        },
        slideMenu: {
            deps: ["jquery"]
        },
        caroussel: {
            deps: ["jquery"]
        },
        bootpag: {
            deps: ["jquery"]
        }
    }
});
requirejs([
    "jquery",
    "router",
    "waves",
    "views/viewSignIn",
    "bootstrap",
    "hammer",
    "slideMenu",
    "caroussel",
    "globals",
    "utils",
    "bootpag",
    "md5"
], function($, Router, Waves, ViewSignIn) {
    $.ajaxSetup({
        beforeSend: function (xhr) {
            var token = getConfiguration("token");
            if (token) {
                xhr.setRequestHeader("Authorization", token);
            }
        },
        statusCode: {
            401: function() {
                setConnected(false);
                Backbone.history.navigate("signIn", {trigger: true});
            },
            403: function() {
                setConnected(false);
                Backbone.history.navigate("signIn", {trigger: true});
            }
        }
    });
    Waves.init();
    Router.init();
});
