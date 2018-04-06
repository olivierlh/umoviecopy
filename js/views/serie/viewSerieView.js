define([
    "backbone.marionette",
    "text!templates/serie/templateSerieView.html",
    "text!templates/serie/templateSerieSeasonCover.html",
    "text!templates/serie/templateSerieBase.html",
    "text!templates/serie/templateSerieSeasonModal.html"
], function (Mn, templateSerieView, templateSerieSeasonCover, templateSerieBase, templateSerieSeasonModal) {

    var collectionInfo = { };
    //test
    var ViewSerieView = Mn.View.extend({

        template: _.template(templateSerieBase),

        initialize: function(options) {
            this.options = options;
            _.bindAll(this, 'render');
            $(window).on("resize", this.updateFrame);
        },

        onAttach: function () {
            setHeaderFooterVisible(true, false);
            var serieId = this.options.serieId;


            $.ajax({
                method: "GET",
                url: getConfiguration("url-server") + "/series/" + serieId,
                cache: false,
                success: function (data) {
                    console.log(data);


                    var genre = "";
                    for (var i=0; i<data.imdb.genres.length -1; i++){
                        genre = genre + data.imdb.genres[i].name+", ";
                    }
                    genre = genre + data.imdb.genres[data.imdb.genres.length -1].name;


                    var serieInfo = {
                        'title': data.imdb.name,
                        'type': genre,
                        'release_date': data.imdb.first_air_date,
                        'description': data.imdb.overview,
                        'cover': data.imdb.poster_path,
                        'rating': data.itunes.results[0].contentAdvisoryRating,
                        'preview': "http://www.youtube.com/embed/" + data.youtube.items[0].id.videoId,
                        'itune_link': data.itunes.results[0].artistViewUrl
                    };


                    $("#divSerieViewMain").empty();
                    $("#divSerieViewMain").prepend(_.template(templateSerieView)({info: serieInfo}));


                    for(var i = 0; i<data.itunes.results.length; i++){
                        var collectionId = data.itunes.results[i].collectionId;
                        var seasonNumber = data.itunes.results[i].collectionName;
                        var seasonPoster = data.itunes.results[i].artworkUrl100;
                        seasonPoster = seasonPoster.substring(0, seasonPoster.lastIndexOf("/")) + "/200x200bb.jpg";

                        var seasonCover = {
                            'seasonNumber' : seasonNumber,
                            'seasonCover' : seasonPoster
                        }
                        $("#divSeasonsList").append(_.template(templateSerieSeasonCover)({info: seasonCover}));


                        $.ajax({
                            method: "GET",
                            url: getConfiguration("url-server") + "/tvshows/seasons/"+ collectionId + "/episodes",
                            cache: false,
                            success: function (data) {
                                console.log(data);
                                var poster = data.itunes.results[0].artworkUrl100;
                                poster = poster.substring(0, poster.lastIndexOf("/")) + "/400x400bb.jpg";
                                var seasonInfo = {
                                    'seasonName' : data.itunes.results[0].collectionName,
                                    'cover': poster,
                                    'episodes': { }
                                };

                                for (i = 0; i < data.itunes.results.length; i++){
                                    var duration = data.itunes.results[i].trackTimeMillis;
                                    var collectionName = data.itunes.results[i].collectionName;
                                    duration = Math.floor(duration/(1000*60));
                                    var name = data.itunes.results[i].trackName;
                                    var trackNumber = data.itunes.results[i].trackNumber;
                                    var description = data.itunes.results[i].longDescription;
                                    var preview = data.itunes.results[i].previewUrl;

                                    seasonInfo.episodes[i]={ "trackId": i, "trackNumber": trackNumber, "trackName": name,
                                        "trackDuration": duration, "trackDescription": description, "trackPreview": preview};

                                    collectionInfo[collectionName] = {seasonInfo};
                                }



                            },
                            error: function (data) {
                            },
                            complete: function () {
                            }
                        });

                    }
                    console.log(collectionInfo);
                    setTimeout(function() {
                        toggleClass_DescriptionText();
                    }, 0);

                    if ($(window).width() < 400) {
                        resizePage();
                    }
                    else{
                        resetPage();
                    }

                    $('.framePreview').innerHeight($('.framePreview').width() * 0.5625);

                },
                error: function (data) {
                },
                complete: function () {
                }
            });


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
            $('.framePreview').innerHeight($('.framePreview').width() * 0.5625);
            toggleClass_DescriptionText();

            if ($(window).width() < 460) {
                $($('.episodePreviewDiv').find('video')[0]).addClass('videoEpisodeResponsive');
            }
            else{
                $($('.episodePreviewDiv').find('video')[0]).removeClass('videoEpisodeResponsive');
            }
        },

        events: {
            'click .get-info-btn': 'getInfo',
            'keyup #searchBarSerie': 'filterSerie'
        },

        filterSerie: function () {
            var search = $('#searchBarSerie').val();
            $.each($('.showHideEpisode'), function(key, value) {
                var name = $(this).data('name');
               if(name.search(search) < 0) {
                   $(this).css('display', 'none');
               } else {
                   $(this).css('display', 'block');
               }
            });
        },

        getInfo: function (e) {
            var season = $(e.currentTarget).data("season");
            var seasonName = collectionInfo[season].seasonInfo.seasonName;
            showAffirmation(seasonName, _.template(templateSerieSeasonModal)({info: collectionInfo[season].seasonInfo}));
            that = this;
            $('#searchBarSerie').bind('keyup',function() {
                that.filterSerie();
            });

            $('.serieEpisode').click(function(e) {
                var trackId = $(e.currentTarget).data("episode");
                var trackSeasonName = $($($('.modal-header')[0]).find('h3')[0])[0].textContent;
                var episodeDescription = collectionInfo[season].seasonInfo.episodes[trackId].trackDescription;
                var episodeName = collectionInfo[season].seasonInfo.episodes[trackId].trackName;
                var episodeNumber = collectionInfo[season].seasonInfo.episodes[trackId].trackNumber;
                var episodePreview = collectionInfo[season].seasonInfo.episodes[trackId].trackPreview;
                var episodeDuration = collectionInfo[season].seasonInfo.episodes[trackId].trackDuration;


                $('.episodePreviewDiv h3')[0].textContent = "Episode " + episodeNumber;
                $('#episodeDescription h6')[0].textContent = "Title: " + episodeName;
                $('#episodeDescription h6')[1].textContent = "Duration : " + episodeDuration + " min";
                $('.descriptionEpisode p')[0].textContent = episodeDescription;
                $('.episodePreviewDiv').find('.videoEpisode').find('source')[0].src = episodePreview;
                $('.episodePreviewDiv').find('video')[0].load();


                if ($(window).width() < 460) {
                    $($('.episodePreviewDiv').find('video')[0]).addClass('videoEpisodeResponsive');
                }


            });

        }

    });

    return ViewSerieView;
});