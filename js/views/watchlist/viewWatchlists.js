define([
    "backbone.marionette",
    "text!templates/watchlist/templateWatchlists.html",
    "text!templates/watchlist/templateWatchlistsList.html",
    "text!templates/watchlist/templateWatchlistInfo.html",
    "text!templates/watchlist/templateWatchlistModalSearchMovie.html"
], function (Mn, templateWatchlists, templateListWatchlists, templateInfoWatchlist, templateWatchlistModalSearchMovie) {

    var ViewWatchlists = Mn.View.extend({
        template: _.template(templateWatchlists),
        initialize: function(options) {
            this.options = options;
            _.bindAll(this, 'render');
            $(window).on("resize", this.updateFrame);
        },
        onAttach: function () {
            ViewWatchlists.movieList = [];
            setHeaderFooterVisible(true, false);
            $.ajax({
                method: "GET",
                url: getConfiguration("url-server") + "/watchlists",
                cache: false,
                success: function(response) {
                    console.log(response);
                    ViewWatchlists.arrayWatchlists = [];
                    ViewWatchlists.arrayWatchlistsSimplified = [];
                    for (var i = 0; i < response.length; i++) {
                        if (response[i].owner && response[i].owner.email == getConfiguration('user_email')) {
                            console.log(response[i]);
                            ViewWatchlists.arrayWatchlistsSimplified[response[i].id] = response[i];
                            ViewWatchlists.arrayWatchlists[ViewWatchlists.arrayWatchlists.length] = response[i];
                        }
                    }
                    templateUserWatchlists();
                },
                error: function(response) {
                },
                complete: function() {
                }
            });
        },
        events: {
            "click #btnCreateNewWatchList" : "createNewWatchList",
            "click #btnSendNewWatchList" : "sendNewWatchList",
            "click .btnViewWatchList" : "viewWatchlist",
            "click #btnDeleteWatchlist" : "deleteWatchlist",
            "click #btnSaveWatchlist" : "saveWatchlist",
            "click .btnDeleteMovie" : "deleteMovie",
            "click #btnAddMovieToWatchlist" : "addMovieToWatchList",
            "click #btnSearchMovie" : "searchMovie",
            "click #closeModalSearch" : "closeModalSearch",
            'click .btnMovie' : 'goToMoviePage'
        },

        goToMoviePage: function(event){
            var movieId = $(event.target.parentElement).data('trackid');
            setTimeout(function() {
                $('.modal-backdrop').remove();
                location.href='#movies/view/'+movieId;
            }, 20);
        },

        createNewWatchList: function() {
            $('#watchlistName').val('');
            $('#newWatchListModal').modal();
        },

        sendNewWatchList: function() {
            if (validateNotEmpty($('#watchlistName'))) {
                var data = {
                    'name' : $('#watchlistName').val()
                };
                $.ajax({
                    method: "POST",
                    url: getConfiguration("url-server") + "/watchlists",
                    data: JSON.stringify(data),
                    contentType: 'application/json',
                    cache: false,
                    success: function(response) {
                        ViewWatchlists.arrayWatchlistsSimplified[response.id] = response;
                        ViewWatchlists.arrayWatchlists[ViewWatchlists.arrayWatchlists.length] = response;
                        templateUserWatchlists();
                    },
                    error: function(response) {
                    },
                    complete: function() {
                    }
                });
            }
        },
        viewWatchlist: function(e) {
            var id = $(e.currentTarget).data("watchlist");
            $("#watchListInfoModal").empty();
            $("#watchListInfoModal").prepend(_.template(templateInfoWatchlist)({info: ViewWatchlists.arrayWatchlistsSimplified[id]}));
            $('#watchListInfoModal').modal();
        },
        addMovieToWatchList: function() {
            var watchListId = ViewWatchlists.currentWatchlist;
            var movieTrackId = $('#selectMovieToAdd').val();
            var data = {};
            for (var i = 0; i < ViewWatchlists.movieList.length; i++) {
                if (ViewWatchlists.movieList[i].id == movieTrackId) {
                    data = ViewWatchlists.movieList[i];
                    var poster_pasth = data.poster_path;
                    if(poster_pasth != null){
                        data.poster_path = "https://image.tmdb.org/t/p/original"+poster_pasth;
                    }
                    else{
                        data.poster_path = "img/nophoto.jpg";
                    }

                }
            }

            $.ajax({
                method: "POST",
                url: getConfiguration("url-server") + "/watchlists/" + watchListId + "/movies",
                data: data,
                cache: false,
                success: function(response) {
                    ViewWatchlists.arrayWatchlistsSimplified[watchListId].movies.push(data);
                    $("#watchListInfoModal").empty();
                    $("#watchListInfoModal").prepend(_.template(templateInfoWatchlist)({info: ViewWatchlists.arrayWatchlistsSimplified[watchListId]}));
                    setTimeout(function() {
                        $('#watchListInfoModal').modal();
                    }, 500);

                },
                error: function(response) {
                    console.log(response);
                },
                complete: function() {
                }
            });
        },
        closeModalSearch : function() {
            $("#watchListInfoModal").empty();
            $("#watchListInfoModal").prepend(_.template(templateInfoWatchlist)({info: ViewWatchlists.arrayWatchlistsSimplified[ViewWatchlists.currentWatchlist]}));
            setTimeout(function() {
                $('#watchListInfoModal').modal();
            }, 500);
        },
        searchMovie: function() {
            if (validateNotEmpty($('#inputSearchMovie'))) {
                ViewWatchlists.currentWatchlist = $('#inputWatchlistId').val();
                $('#inputSearchMovie').removeClass('error');
                var data = {
                    q : $('#inputSearchMovie').val()
                };
                $.ajax({
                    method: "GET",
                    url: getConfiguration("url-server") + "/search/movies",
                    data: data,
                    cache: false,
                    success: function(response) {
                        console.log(response);
                        if (response.imdb.results.length > 0) {
                            ViewWatchlists.movieList = response.imdb.results;
                            for (var z = 0; z < ViewWatchlists.arrayWatchlistsSimplified[ ViewWatchlists.currentWatchlist].movies.length; z++) {
                                for (var y = 0; y < response.imdb.results.length; y++) {

                                        if (response.imdb.results[y].id == ViewWatchlists.arrayWatchlistsSimplified[ ViewWatchlists.currentWatchlist].movies[z].id) {
                                            console.log(ViewWatchlists.movieList);
                                            ViewWatchlists.movieList = ViewWatchlists.movieList.filter(function(el) {
                                                console.log(el.title);
                                                return (el.id !== response.imdb.results[y].id && el.title != "undefined");
                                            });

                                        }
                                        else{
                                            ViewWatchlists.movieList = ViewWatchlists.movieList.filter(function(el) {
                                                return (el.title != "undefined");
                                            });
                                        }

                                }
                            }
                            $("#watchListInfoModal").empty();
                            $("#watchListInfoModal").prepend(_.template(templateWatchlistModalSearchMovie)({movies: ViewWatchlists.movieList}));
                            $('#watchListInfoModal').modal();
                        } else {
                            $('#inputSearchMovie').addClass('error');
                            $('#inputSearchMovie').val('');
                            $('#inputSearchMovie').attr('placeholder', 'No Result');
                        }
                    },
                    error: function(response) {
                        console.log(response);
                    },
                    complete: function() {
                    }
                });
            }
        },
        deleteWatchlist: function() {
            var id = $('#inputWatchlistId').val();
            var newArray = [];
            ViewWatchlists.arrayWatchlists = ViewWatchlists.arrayWatchlists.filter(function(el) {
                return el.id !== id;
            });
            for(var i = 0; i < ViewWatchlists.arrayWatchlists.length; i++) {
                newArray[ViewWatchlists.arrayWatchlists[i].id] = ViewWatchlists.arrayWatchlists[i];
            }
            ViewWatchlists.arrayWatchlistsSimplified = newArray;
            console.log(ViewWatchlists.arrayWatchlists);
            console.log(ViewWatchlists.arrayWatchlistsSimplified);

            $.ajax({
                method: "DELETE",
                url: getConfiguration("url-server") + "/watchlists/" + id,
                cache: false,
                success: function(response) {
                    console.log(response);
                    templateUserWatchlists();
                },
                error: function(response) {
                },
                complete: function() {
                }
            });
        },
        saveWatchlist: function() {
            if (validateNotEmpty($('#inputEditWatchListName'))) {
                var id = $('#inputWatchlistId').val();
                ViewWatchlists.arrayWatchlistsSimplified[id].name = $('#inputEditWatchListName').val();
                for (var i = 0; i < ViewWatchlists.arrayWatchlists.length; i++) {
                    if (ViewWatchlists.arrayWatchlists.id == id) {
                        ViewWatchlists.arrayWatchlists[i].name = $('#inputEditWatchListName').val();
                        break;
                    }
                }
                $.ajax({
                    method: "PUT",
                    url: getConfiguration("url-server") + "/watchlists/" + id,
                    data: JSON.stringify(ViewWatchlists.arrayWatchlistsSimplified[id]),
                    contentType: 'application/json',
                    cache: false,
                    success: function(response) {
                        console.log(response);
                        templateUserWatchlists();
                    },
                    error: function(response) {
                        console.log(response);
                    },
                    complete: function() {
                    }
                });
            }
        },
        deleteMovie: function(e) {
            var trackId = $(e.currentTarget).attr('id');
            var watchlistId = $('#inputWatchlistId').val();
            $('.movieWatchListEntry').each(function() {
                if ($(this).data('trackid') == trackId) {
                    $(this).hide();
                }
            });

            $.ajax({
                method: "DELETE",
                url: getConfiguration("url-server") + "/watchlists/" + watchlistId + "/movies/" + trackId,
                cache: false,
                success: function(response) {
                    console.log(response);
                    ViewWatchlists.arrayWatchlistsSimplified[watchlistId] = response;
                    for (var i = 0; i < ViewWatchlists.arrayWatchlists.length; i++) {
                        if (ViewWatchlists.arrayWatchlists[i].id == watchlistId) {
                            ViewWatchlists.arrayWatchlists[i] = response;
                        }
                    }
                    templateUserWatchlists();
                },
                error: function(response) {
                    console.log(response);
                },
                complete: function() {
                }
            });
        }

    });

    function templateUserWatchlists() {
        $("#divUserWatchlists").empty();
        $("#divUserWatchlists").prepend(_.template(templateListWatchlists)({watchlists: ViewWatchlists.arrayWatchlists}));
    }


    return ViewWatchlists;
});