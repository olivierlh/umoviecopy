define([
    "backbone.marionette",
    "waves",
    "imgToSvg",
    "text!templates/templateGlobalMenu.html",
    "text!templates/templateSearchResult.html",
    "text!templates/templateSearchResultFilters.html",
    "text!templates/movie/templateSelectWatchListModal.html"
], function (Mn, Waves, ImgToSvg, templateGlobalMenu, templateSearchResult, templateSearchResultFilters, templateSelectWatchListModal) {

    var filtersList = new Set();

    var ViewGlobalMenu = Mn.View.extend({

        el: "#divMain",
        template: _.template(templateGlobalMenu),

        initialize: function () {
            $(window).on("resize", this.resizeHeader);

        },

        regions: {
            regionMain: "#divRegionMain"
        },

        events: {
            'click #logout': 'logout',
            'click #searchIcon': 'openSearchGeneral',
            'click #closeSearchIcon': 'closeSearchGeneral',
            'click .btnGoToPage': 'goToPage',
            'click #filters': 'showHideFilters',
            'click  .filterBtn': 'activateFilter',
            'click .btnAddWatchlist': 'selectWatchList',
            'click #btnFilterGenre': 'showModalGenre'
        },

        onRender: function () {
            this.genreList = [];
            Waves.attach(".waves-effect");
            $("#divSlideMenuLeft").slideMenu({
                position: "left",
                toggles: ["#btnToggleMenuLeft"]
            });

            if (getConfiguration('user_email') && getConfiguration('user_name')) {
                $('#slideMenuUserName').html(getConfiguration('user_name'));
                $('#slideMenuEmailAddress').html(getConfiguration('user_email'));
                updateSideMenuPicture(fetchImageFromGravatar(getConfiguration('user_email')));
            }

            this.constructGenreList();

            resizeHeader();
        },

        resizeHeader: function () {
            resizeHeader();
        },

        loadRegionView: function (view) {
            this.showChildView("regionMain", view);
            unwrapView(this.getChildView("regionMain"));
        },

        logout: function () {
            setConnected(false);
            Backbone.history.navigate("signIn", {trigger: true});
        },

        showModalGenre: function() {
            if ($('#btnFilterGenre').css('backgroundColor') == 'rgb(53, 93, 179)') {
                $('#modalGenre').modal();
            }
            var that = this;
            $('.genre').on('change', function() {
                that.constructGenreList();
            });
        },

        constructGenreList: function() {
            this.genreList = [];
            var that = this;
            $.each($('.genre'), function (index, value) {
                  if ($(this).prop('checked')) {
                      console.log(index);
                    that.genreList.push($(this).data('value'));
                  }
                  if (index == 14) {
                      that.filterByGenre();
                  }
            });
        },

        filterByGenre: function() {
            console.log(this.genreList);
            
        },

        openSearchGeneral: function () {
            $("#searchContainerDiv")[0].style.display = 'none';
            $($("#searchBar").find('div'))[0].style.display = "inline-flex";

            $("#searchBar").find('input').on('keyup', function () {
                if ($("#searchBar").find('input')[0].value != "") {
                    if ($("#filters").text() != 'Hide filters') {
                        $("#searchContainer").removeClass('searchContainerFilter');
                        $("#searchContainer")[0].style.display = "block";
                        $("#searchContainerList")[0].style.display = 'block';
                        $("#searchContainer").addClass('visible');
                    }
                    else {
                        $("#searchContainer").addClass('searchContainerFilter');
                        $("#searchContainer").addClass('visible');
                    }
                    sendRequestSearchUmovie();
                }
                else {
                    $("#searchContainer").removeClass('visible');
                    $("#searchContainerList").empty();
                    $("#searchContainerDiv").empty();
                    setTimeout(function () {
                        $("#searchContainer")[0].style.display = "none";
                        $("#searchContainer").removeClass('searchContainerFilter');
                    }, 200);
                }
            });
            $($("#searchBar").find('div')).addClass('visible');
            $("#divRegionMainContainer").addClass('searchBarOpen');
        },

        selectWatchList: function (e) {
            var id = ($(e.currentTarget)).data('trackid');
            var type = ($(e.currentTarget)).data('tracktype');
            if(type === 'movie'){
                $.ajax({
                method: "GET",
                url: getConfiguration("url-server") + "/watchlists",
                cache: false,
                success: function (data) {
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
                                nbWatchlists = nbWatchlists + 1;
                                messages.push({
                                    'watchListId': data[i].id,
                                    'watchListName': data[i].name
                                });
                            }
                        }
                    }
                    console.log(id)
                    if (noWatchlist || nbWatchlists == 0) {
                        showConfirmation_addToWatchlist("There is no available watchlist to add the current movie. Create a new watchlist.", id);
                    }
                    else {
                        showConfirmation_addToWatchlist(_.template(templateSelectWatchListModal)({info: messages}), id);
                    }
                },
                error: function (message) {
                },
                complete: function () {
                }
            });} if(type === 'user'){
                $.ajax({
                    context: this,
                    method: "POST",
                    url: getConfiguration('url-server') + "/follow",
                    data: JSON.stringify({
                        id: id
                    }),
                    contentType: 'application/json',
                    cache: false,
                    success: function(response) {
                        this.isFollowed = true;
                        showAffirmation('Success', 'You are now following this user!');
                    },
                    error: function(response) {
                        showAffirmation('Error', 'Oups! An error occured when we tried to add this user to your following list!');
                    }

                });
            }
        },

        closeSearchGeneral: function (e) {
            $("#filtersContainer")[0].style.display = "none";
            $($("#searchBar").find('div')).removeClass('visible');
            if ($("#filters").text() != 'Show filters') {
                $("#searchContainer").removeClass('searchContainerFilter');
                $("#searchContainerDiv")[0].style.display = 'none';
                $("#searchContainerList")[0].style.display = 'none';
            }


            $("#searchContainer")[0].style.display = "none";
            $("#divRegionMainContainer").removeClass('searchBarOpen');
            setTimeout(function () {
                $($("#searchBar").find('div'))[0].style.display = "";
                $($($($("#searchBar").find('div'))[0]).find('input')[0]).val("");
                $("#searchContainerList").empty();
                $("#filters").text('Show filters');
            }, 200);
        },

        showHideFilters: function (e) {
            if ($("#searchBar").find('input')[0].value == "") {
                console.log("ok");
                $("#searchContainerList").empty();
                $("#searchContainerDiv").empty();
            }
            if ($("#filters").text() == 'Show filters') {
                $("#filtersContainer")[0].style.display = "flex";
                $("#filters").text('Hide filters');

                if ($("#searchBar").find('input')[0].value != "") {
                    $("#searchContainer").addClass('searchContainerFilter');
                }
                $("#searchContainerList")[0].style.display = 'none';
                $("#searchContainerDiv")[0].style.display = 'flex';
            }
            else {
                $("#filtersContainer")[0].style.display = "none";
                $("#filters").text('Show filters');
                $("#searchContainer").removeClass('searchContainerFilter');
                $("#searchContainer")[0].style.display = "block";
                $("#searchContainerDiv")[0].style.display = 'none';
                $("#searchContainerList")[0].style.display = 'block';
            }
        },

        activateFilter: function (event) {
            var typeFilter = $($(event.target)[0]).data("btnfilter");
            if($(event.target)[0].style.backgroundColor == 'rgb(53, 93, 179)'){
                filtersList.delete(typeFilter);
                $(event.target)[0].style.backgroundColor = "rgba(53, 93, 179, 0)";
            } else {
                filtersList.add(typeFilter);
                $(event.target)[0].style.backgroundColor = 'rgb(53, 93, 179)'
            }

            for (var i = 0; i < $("#searchContainerDiv").find('.btnGoToPage').length; i++){
                var type = $($("#searchContainerDiv").find('.btnGoToPage')[i]).data("tracktype");
                if(!filtersList.has(type)){
                    $("#searchContainerDiv").find('.btnGoToPage')[i].style.display = 'none';
                }
                else{
                    $("#searchContainerDiv").find('.btnGoToPage')[i].style.display = 'block';

                }
            }

            if(filtersList.size == 0){
                for (var i = 0; i< $("#searchContainerDiv").find('.btnGoToPage').length; i++){
                    $("#searchContainerDiv").find('.btnGoToPage')[i].style.display = 'block';

                }
            }

        },

        goToPage: function (event) {
            var id = $(event.target).data('trackid');
            var type = $(event.target).data('tracktype');
            if (type === 'movie') {
                setTimeout(function () {
                    $('.modal-backdrop').remove();
                    location.href = '#movies/view/' + id;
                }, 20);
            }
            if (type === 'tv') {
                setTimeout(function () {
                    $('.modal-backdrop').remove();
                    location.href = '#series/view/' + id;
                }, 20);
            }
            if (type === 'person') {
                setTimeout(function () {
                    $('.modal-backdrop').remove();
                    location.href = '#actors/view/' + id;
                }, 20);
            }
            if (type === 'user') {
                setTimeout(function () {
                    $('.modal-backdrop').remove();
                    location.href = "#users/" + id;
                }, 20);

            }
            this.closeSearchGeneral();
        },

    });

    function resizeHeader() {
        if ($(window).width() < 530) {
            $("#closeSearchIcon")[0].style.maxWidth = "";
        }

        if ($(window).width() < 370) {
            resizeLogo();
        }
        else {
            resetLogo()
        }

        if ($(window).width() < 530) {
            $('#searchBar')[0].style.left = "45px";
            $("#btnToggleMenuLeft")[0].style.fontSize = "20px";
            $("#searchIcon")[0].style.fontSize = "20px";
            $("#closeSearchIcon")[0].style.fontSize = "20px";
            $("#closeSearchIcon")[0].style.maxWidth = "155px";
            $("#searchBar")[0].style.fontSize = "12px";
            $("#filters")[0].style.fontSize = "0.7em";
            $("#filters")[0].style.padding = "5px";
            $(".filterBtn")[0].style.fontSize = "0.7em";

        }
        else {
            $('#searchBar')[0].style.left = "60px";
            $("#btnToggleMenuLeft")[0].style.fontSize = "32px";
            $("#searchIcon")[0].style.fontSize = "32px";
            $("#closeSearchIcon")[0].style.fontSize = "32px";
            $("#closeSearchIcon")[0].style.maxWidth = "210px";
            $("#searchBar")[0].style.fontSize = "25px";
            $("#filters")[0].style.fontSize = "";
            $("#filters")[0].style.padding = "10px";
            $(".filterBtn")[0].style.fontSize = "";
        }
    }

    function sendRequestSearchUmovie() {
        $.ajax({
            method: "GET",
            url: getConfiguration("url-server") + "/search?q=" + $("#searchBar").find('input')[0].value,
            cache: false,
            success: function (response) {
                $("#searchContainerList").empty();
                $("#searchContainerDiv").empty();
                console.log(response);

                for (i = 0; i < response.imdb.length; i++) {
                    var mediaType = response.imdb[i].media_type;
                    var cover;
                    var name;
                    var addButtonVisible = 'none';
                    var id = response.imdb[i].id;
                    if (mediaType == "movie" || mediaType == "tv") {
                        cover = response.imdb[i].poster_path;
                        if (cover == null) {
                            cover = 'img/nophoto.jpg';
                        }
                        else {
                            cover = 'https://image.tmdb.org/t/p/w92' + cover;
                        }

                        if (mediaType == "movie") {
                            addButtonVisible = 'block';
                            name = response.imdb[i].title;
                        }
                        else {
                            name = response.imdb[i].name;
                        }
                    }
                    else {
                        cover = response.imdb[i].profile_path;
                        if (cover == null) {
                            cover = 'img/actor/nophoto.jpg';
                        }
                        else {
                            cover = 'https://image.tmdb.org/t/p/w45' + cover;
                        }
                        name = response.imdb[i].name;
                    }

                    message = {
                        'coverResult': cover,
                        'nameResult': name,
                        'typeResult': mediaType,
                        'id': id,
                        'addBtn': addButtonVisible
                    }

                    $("#searchContainerList").append(_.template(templateSearchResult)({info: message}));
                    $("#searchContainerDiv").append(_.template(templateSearchResultFilters)({info: message}));

                }
                for (i = 0; i < response.users.length; i++) {
                    var mediaType = 'user';
                    var userName = response.users[i].name;
                    var cover = 'img/nophoto.jpg';
                    var id = response.users[i].id;
                    var addButtonVisible = 'block';

                    message = {
                        'coverResult': cover,
                        'nameResult': userName,
                        'typeResult': mediaType,
                        'id': id,
                        'addBtn': addButtonVisible
                    }

                    $("#searchContainerList").append(_.template(templateSearchResult)({info: message}));
                    $("#searchContainerDiv").append(_.template(templateSearchResultFilters)({info: message}));

                }
            },
            error: function (response) {
            },
            complete: function () {
            }
        });


    }


    return ViewGlobalMenu;

});