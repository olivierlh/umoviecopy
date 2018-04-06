define([
    "backbone.marionette",
    "text!templates/movie/templateMovieIndex.html",
    "text!templates/movie/templateMovieBase.html",
    "text!templates/movie/templateMovieAll.html"
], function (Mn, templateMovieIndex, templateMovieBase, templateMovieAll) {

    var ViewMovieIndex = Mn.View.extend({

        template: _.template(templateMovieBase),

        onAttach: function () {
            setHeaderFooterVisible(true, false);
            $.ajax({
                method: "GET",
                url: getConfiguration("url-server") + "/genres/movies",
                cache: false,
                success: function (message) {
                    $('#divMovieViewMain').empty();
                    $('#divMovieViewMain').prepend(_.template(templateMovieIndex)({info: message.imdb.genres}));
                    function getMovies(page) {
                        return $.ajax({
                            method: "GET",
                            url: getConfiguration("url-server") + "/discover/movie?genre=" + $("#dropdownMovie").val() + "&page=" + page,
                            cache: false,
                            success: function (message) {
                                console.log(message)
                                var movies = [];
                                var total_pages = message.total_pages;
                                for (i = 0; i < message.imdb.length; i++) {
                                    var artwork;
                                    if (message.imdb[i].poster_path !== "https://image.tmdb.org/t/p/originalnull") {
                                        artwork = message.imdb[i].poster_path
                                    }
                                    else {
                                        artwork = 'img/nophoto.jpg'
                                    }
                                    var year = (message.imdb[i].release_date).substr(0, 4);
                                    var name = message.imdb[i].title;
                                    var trackId = message.imdb[i].id;
                                    if(name!= "undefined"){
                                        var movie = {
                                            'artwork': artwork,
                                            'year': year,
                                            'name': name,
                                            'trackId': trackId
                                        }
                                        movies.push(movie);
                                    }
                                }
                                $('.pagination_bottom').bootpag({
                                    total: total_pages,
                                    page: page,
                                    maxVisible: 5,
                                    leaps: true,
                                    firstLastUse: true,
                                    first: '<span aria-hidden="true">&larr;</span>',
                                    last: '<span aria-hidden="true">&rarr;</span>',
                                    wrapClass: 'pagination',
                                    activeClass: 'active',
                                    disabledClass: 'disabled',
                                    nextClass: 'next',
                                    prevClass: 'prev',
                                    lastClass: 'last',
                                    firstClass: 'first'
                                })
                                $('#movies').empty();
                                $('#movies').prepend(_.template(templateMovieAll)({info: movies}));
                            },
                            error: function (message) {
                            },
                            complete: function () {
                            }
                        });
                    }

                    setTimeout(function () {
                        $('.pagination_bottom').on("page", function (event, num) {
                            getMovies(num)
                        }).find('.pagination');

                        $("#dropdownMovie").change(function () {
                            getMovies(1)
                        });
                    }, 200)
                    getMovies(1);
                },
                error: function (message) {
                    console.log(message)
                },
                complete: function () {
                }
            });
        },
        events: {
            'click .moviesDisplay': 'goToMoviePage'
        },

        goToMoviePage: function (event) {
            var movieId = $(event.target.parentElement).data('trackid');
            setTimeout(function () {
                $('.modal-backdrop').remove();
                location.href = '#movies/view/' + movieId;
            }, 20);
        },


    });

    return ViewMovieIndex;
});