define([
    "backbone.marionette",
    "text!templates/movie/templateMovieView.html",
    "text!templates/movie/templateMovieBase.html",
    "text!templates/movie/templateSelectWatchListModal.html"
], function (Mn, templateMovieView, templateMovieBase, templateSelectWatchListModal) {

    var ViewMovieView = Mn.View.extend({

        //todo : templater une autre view éventuellement.
        template: _.template(templateMovieBase),

        initialize: function (options) {
            this.options = options;
            _.bindAll(this, 'render');
            $(window).on("resize", this.updateFrame);
        },

        onAttach: function () {
            setHeaderFooterVisible(true, false);
            var movieId = this.options.movieId;

            $.ajax({
                method: "GET",
                url: getConfiguration("url-server") + "/movies/" + movieId,
                cache: false,
                success: function (data) {
                    console.log(data);
                    if(data.itunes.results[0] != undefined){
                        var genre = "";
                        for (var i=0; i<data.imdb.genres.length -1; i++){
                            genre = genre + data.imdb.genres[i].name+", ";
                        }
                        genre = genre + data.imdb.genres[data.imdb.genres.length -1].name;

                        var message = {
                            'title': data.imdb.title,
                            'type': genre,
                            'release_date': data.imdb.release_date,
                            'description': data.itunes.results[0].longDescription,
                            'cover': data.imdb.poster_path,
                            'rating': data.itunes.results[0].contentAdvisoryRating,
                            'preview': "http://www.youtube.com/embed/" + data.youtube.items[0].id.videoId,
                            'itune_link': data.itunes.results[0].trackViewUrl
                        };
                        $("#divMovieViewMain").empty();

                        $("#divMovieViewMain").prepend(_.template(templateMovieView)({info: message}));
                        $('.framePreview').innerHeight($('.framePreview').width() * 0.5625);
                        $("#addToWatchList_div").find("button").data("movie", movieId);

                        setTimeout(function () {
                            toggleClass_DescriptionText();
                        }, 0);
                        resize();

                    }

                },
                error: function (data) {
                },
                complete: function () {
                }
            });

        },


        updateFrame: function () {
            resize();
            $('.framePreview').innerHeight($('.framePreview').width() * 0.5625);
            toggleClass_DescriptionText();
        },

        events: {
            'click .btnWatchList': 'selectWatchList'
        },

        selectWatchList: function (e) {
            $.ajax({
                method: "GET",
                url: getConfiguration("url-server") + "/watchlists",
                cache: false,
                success: function (data) {
                    console.log(data);
                    var messages = [];
                    var noWatchlist = true;
                    var nbWatchlists = 0;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].owner && data[i].owner.email == getConfiguration('user_email')) {
                            var notPresent = true;
                            noWatchlist = false;
                            for (var x = 0; x < data[i].movies.length; x++) {
                                if (data[i].movies[x].id == $(e.currentTarget).data('movie')) {
                                    notPresent = false;
                                }
                            }
                            if (notPresent) {
                                nbWatchlists = nbWatchlists +1;
                                messages.push({
                                    'watchListId' :  data[i].id,
                                    'watchListName' : data[i].name
                                });
                            }
                        }
                    }
                    var movieId = $(e.currentTarget).data("movie");
                    if(noWatchlist || nbWatchlists == 0){
                        showConfirmation_addToWatchlist("There is no available watchlist to add the current movie. Create a new watchlist.", movieId);
                    }
                    else{
                        showConfirmation_addToWatchlist(_.template(templateSelectWatchListModal)({info: messages}), movieId);
                    }
                },
                error: function (message) {
                },
                complete: function () {
                }
            });
        }
    });

    function resize(){
        if ($(window).width() <= 434) {
            resizeToMedium_AddWatchList_btn();
        }
        else {
            resetToNormal_AddWatchList_btn();
        }
        if ($(window).width() < 400) {
            resizeToSmall_AddWatchList_btn();
            resizePage();
        }
        else {
            resetToMedium_AddWatchList_btn();
            resetPage();
        }
    }

    return ViewMovieView;
});

