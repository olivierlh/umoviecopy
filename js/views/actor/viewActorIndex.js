/**
 * Created by simla on 2017-01-30.
 */
define([
    "backbone.marionette",
    "text!templates/actor/templateActorIndex.html",
    "text!templates/actor/templateActorBase.html",
    "text!templates/actor/templateActorAll.html"
], function (Mn, templateActorIndex, templateActorBase, templateActorAll) {

    var ViewActorIndex = Mn.View.extend({

        template: _.template(templateActorBase),

        onAttach: function () {
            setHeaderFooterVisible(true, false);
            var message = {};
            console.log(message)
            $('#divActorViewMain').empty();
            $('#divActorViewMain').prepend(_.template(templateActorIndex)({info: message}));
            function getActors(page) {
                return $.ajax({
                    method: "GET",
                    url: getConfiguration("url-server") + "/discover/actor" + "?page=" + page,
                    cache: false,
                    success: function (message) {
                        console.log(message)
                        var total_pages = message.total_pages;
                        var actors = [];
                        for (i = 0; i < message.imdb.length; i++) {
                            var artwork;
                            if (message.imdb[i].profile_path !== null) {
                                artwork = "https://image.tmdb.org/t/p/w600_and_h900_bestv2/" + message.imdb[i].profile_path
                            }
                            else {
                                artwork = "img/actor/nophoto.jpg"
                            }
                            var name = (message.imdb[i].name)
                            var trackId = message.imdb[i].id;
                            if(name != "undefined"){
                                var actor = {
                                    'artwork': artwork,
                                    'name': name,
                                    'trackId': trackId
                                }
                                actors.push(actor);
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
                        $('#actors').empty();
                        $('#actors').prepend(_.template(templateActorAll)({info: actors}));
                    },
                    error: function (message) {
                    },
                    complete: function () {
                    }
                });
            }

            setTimeout(function () {
                $('.pagination_bottom').on("page", function (event, num) {
                    getActors(num)
                }).find('.pagination');
            }, 200)
            getActors(1);

        },
        events: {
            'click .actorsDisplay': 'goToActorPage'
        },

        goToActorPage: function (event) {
            var actorId = $(event.target.parentElement).data('trackid');
            setTimeout(function () {
                $('.modal-backdrop').remove();
                location.href = '#actors/view/' + actorId;
            }, 20);
        },
    });

    return ViewActorIndex;
});