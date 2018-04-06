/**
 * Created by apage on 2017-01-30.
 */
define([
    "backbone.marionette",
    "text!templates/actor/templateActorView.html",
    "text!templates/actor/templateActorMovieView.html",
    "text!templates/actor/templateActorBase.html",
    "text!templates/actor/templateActorViewMovieInfo.html",
], function (Mn, templateActorView, templateActorMovieView, templateActorBase, templateActorViewMovieInfo) {
    var collectionInfo = {};
    var ViewActorView = Mn.View.extend({


        //todo : templater une autre view éventuellement.
        template: _.template(templateActorBase),

        initialize: function (options) {
            this.options = options;
            _.bindAll(this, 'render');
            $(window).on("resize", this.updateFrame);
        },

        events: {
            'click .btnViewInfoMovie': 'getInfo'
        },

        onAttach: function () {
            var id = this.options.actorId;
            setHeaderFooterVisible(true, false);
            $.ajax({
                method: "GET",
                url: getConfiguration("url-server") + "/actors/" + id,
                cache: false,
                success: function (data) {
                    console.log(data);
                    var nameArtist = data.itunes.results[0].artistName;
                    var idArtist = data.imdb.imdb_id;
                    var genre = data.itunes.results[0].primaryGenreName;
                    var description = data.imdb.biography;
                    if (description.indexOf("Description above from the Wikipedia") != -1) {
                        description = description.substr(0, description.indexOf("Description above from the Wikipedia"));
                    }
                    var descriptionLink = "http://www.imdb.com/name/" + idArtist + "/bio";

                    var message = {
                        'artistLinkUrl': data.itunes.results[0].artistLinkUrl,
                        'description': description,
                        'cover': data.imdb.profile_path,
                        'type': genre,
                        'descriptionLink': descriptionLink,
                        'actor': nameArtist
                    };
                    $("#divActorViewMain").empty();
                    $("#divActorViewMain").prepend(_.template(templateActorView)({info: message}));

                    if ($(window).width() < 400) {
                        resizePage();
                    }
                    else {
                        resetPage();
                    }

                    setTimeout(function () {
                        toggleClass_DescriptionText();
                    }, 0);


                    console.log(data.movies.results);
                    //Get info of each movie
                    for (i = 0; i < data.movies.results.length; i++) {
                        var movieId = data.movies.results[i].id;
                        $.ajax({
                            method: "GET",
                            url: getConfiguration("url-server") + "/movies/" + movieId,
                            cache: false,

                            success: function (data) {
                                var imageUrl = data.imdb.poster_path;
                                var movieName = data.imdb.title;
                                var release = data.imdb.release_date;

                                var movie = {
                                    'movieTitle': movieName,
                                    'coverMovie': imageUrl
                                }

                                $("#divMoviesList").append(_.template(templateActorMovieView)({info: movie}));

                                var genre = "";
                                for (var i = 0; i < data.imdb.genres.length - 1; i++) {
                                    genre = genre + data.imdb.genres[i].name + ", ";
                                }
                                genre = genre + data.imdb.genres[data.imdb.genres.length - 1].name;

                                var movieInfo = {
                                    'cover': imageUrl,
                                    'release_date': release,
                                    'genre': genre,
                                    'rating': data.itunes.results[0].contentAdvisoryRating,
                                    'itune_link': data.itunes.results[0].trackViewUrl,
                                };
                                collectionInfo[movieName] = {movieInfo};

                            },
                            error: function (data) {
                            },
                            complete: function () {
                            }
                        });
                    }
                    if ($(window).width() < 400) {
                        setTimeout(function () {
                            resizePicture();
                        }, 0);
                    }
                },
                error: function (message) {
                },
                complete: function () {
                }
            });

            setTimeout(function () {

            }, 0);

        },

        getInfo: function (e) {
            var movie = $(e.currentTarget).data("movie");
            showAffirmation(movie, _.template(templateActorViewMovieInfo)({info: collectionInfo[movie].movieInfo}));
        },


        updateFrame: function () {
            if ($(window).width() < 400) {
                resizePage();
                resizePicture();
            }
            else {
                resetPage();
                resetPicture();
            }
            toggleClass_DescriptionText();
        }


    });

    return ViewActorView;
});