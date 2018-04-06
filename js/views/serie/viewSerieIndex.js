define([
    "backbone.marionette",
    "text!templates/serie/templateSerieIndex.html",
    "text!templates/serie/templateSerieBase.html",
    "text!templates/serie/templateSerieAll.html"
], function (Mn, templateSerieIndex, templateSerieBase, templateSerieAll) {

    var ViewSerieIndex = Mn.View.extend({

        template: _.template(templateSerieBase),

        onAttach: function () {
            setHeaderFooterVisible(true, false);
            $.ajax({
                method: "GET",
                url: getConfiguration("url-server") + "/genres/tvshows",
                cache: false,
                success: function (message) {
                    $("#divSerieViewMain").empty();
                    $("#divSerieViewMain").prepend(_.template(templateSerieIndex)({info: message.imdb.genres}));
                    function getSeries(page) {
                        return $.ajax({
                            method: "GET",
                            url: getConfiguration("url-server") + "/discover/serie?genre=" + $("#dropdownSerie").val() + "&page=" + page,
                            cache: false,
                            success: function (message) {
                                console.log(message)
                                var series = [];
                                var names = [];
                                var total_pages = message.total_pages;
                                for (i = 0; i < message.imdb.length; i++) {
                                    var artwork;
                                    if (message.imdb[i].poster_path !== "https://image.tmdb.org/t/p/originalnull") {
                                        artwork = message.imdb[i].poster_path
                                    } else {
                                        artwork = 'img/nophoto.jpg'
                                    }
                                    var year = (message.imdb[i].first_air_date).substr(0, 4);
                                    var name = (message.imdb[i].name)
                                    var trackId = message.imdb[i].id;
                                    if(name!= "undefined"){
                                        if (!names.includes(name)) {
                                            names.push(name)
                                            var serie = {
                                                'artwork': artwork,
                                                'year': year,
                                                'name': name,
                                                'trackId': trackId
                                            }
                                            series.push(serie)
                                        }
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
                                $('#series').empty();
                                $('#series').prepend(_.template(templateSerieAll)({info: series}));
                            },
                            error: function (message) {
                            },
                            complete: function () {
                            }
                        });
                    }

                    setTimeout(function () {
                        $('.pagination_bottom').on("page", function (event, num) {
                            getSeries(num)
                        }).find('.pagination');

                        $("#dropdownSerie").change(function () {
                            getSeries(1)
                        });
                    }, 200)
                    getSeries(1);
                },
                error: function (message) {
                    console.log(message)
                },
                complete: function () {
                }
            });

        },

        events: {
            'click .seriesDisplay': 'goToSeriePage'
        },

        goToSeriePage: function (event) {
            var serieId = $(event.target.parentElement).data('trackid');
            setTimeout(function () {
                $('.modal-backdrop').remove();
                location.href = '#series/view/' + serieId;
            }, 20);
        },

    });

    return ViewSerieIndex;
});