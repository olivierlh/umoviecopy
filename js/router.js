define([
    "backbone.marionette",
    "waves",
    "views/viewGlobalMenu",
    "views/intro/viewIntro",
    "views/movie/viewMovieIndex",
    "views/movie/viewMovieView",
    "views/serie/viewSerieIndex",
    "views/serie/viewSerieView",
    "views/actor/viewActorIndex",
    "views/actor/viewActorView",
    "views/watchlist/viewWatchlists",
    "views/viewSignUp",
    "views/viewSignIn",
    "views/user/viewUser"

], function(Mn, Waves, ViewGlobalMenu, ViewIntro, ViewMovieIndex, ViewMovieView, ViewSerieIndex, ViewSerieView, ViewActorIndex, ViewActorView, ViewWatchlists, ViewSignUp, ViewSignIn, ViewUser) {

    var Router = Mn.AppRouter.extend({

        currentView: null,

        routes: {
            "index": "index",
            "movies/index": "movieIndex",
            "movies/view/:movieId": "movieView",
            "series/index": "serieIndex",
            "series/view/:serieId": "serieView",
            "actors/index": "actorIndex",
            "actors/view/:actorId": "actorView",
            "users/:userId": "userView",
            "watchlists" : "watchlists",
            "signUp" : "signUp",
            "signIn" : "signIn",
            "search": "searchGeneral",
            "*path": "default",

        },

        init: function() {
            Backbone.history.start();
        },

        execute: function(callback, args, name) {
            if (isConnected() && name !== 'signIn' && name !== 'signUp') {
                callback.apply(this, args);
            } else if (name === "signUp" && !isConnected()) {
                this.loadGlobalMenuView(new ViewSignUp());
            } else {
                Backbone.history.navigate("signIn", {trigger: true});
                this.loadGlobalMenuView(new ViewSignIn());
            }
        },

        index: function() {
            this.loadGlobalMenuView(new ViewIntro());
        },

        movieIndex: function() {
            this.loadGlobalMenuView(new ViewMovieIndex());
        },

        movieView: function(movieId) {
            this.loadGlobalMenuView(new ViewMovieView({
                movieId: movieId,
            }));
        },

        serieIndex: function() {
            this.loadGlobalMenuView(new ViewSerieIndex());
        },

        serieView: function(serieId) {
            this.loadGlobalMenuView(new ViewSerieView({
                serieId: serieId
            }));
        },

        actorIndex:function(){
          this.loadGlobalMenuView(new ViewActorIndex());
        },

        actorView: function(actorId){
          this.loadGlobalMenuView(new ViewActorView({
              actorId: actorId
          }));
        },

        userView: function(userId){
            this.loadGlobalMenuView(new ViewUser({
                userId: userId
            }));
        },

        watchlists: function() {
            this.loadGlobalMenuView(new ViewWatchlists);
        },

        signUp: function() {
            this.loadGlobalMenuView(new ViewSignUp());
        },

        signIn: function() {
            this.loadGlobalMenuView(new ViewSignIn());
        },

        default: function() {
            if (isConnected()) {
                Backbone.history.navigate("index", {trigger: true, replace: true});
            } else {
                this.loadGlobalMenuView(new ViewSignIn());
            }
        },


        loadGlobalMenuView: function(view) {
            if (!(this.currentView instanceof ViewGlobalMenu)) {
                this.currentView = new ViewGlobalMenu();
                this.currentView.render();
            }
            showHeader();
            this.currentView.loadRegionView(view);
        },

    });

    return new Router;

});