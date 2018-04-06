define([
    "backbone.marionette",
    "text!templates/intro/templateIntro.html"
], function(Mn, templateIntro) {
    var observer;

    var ViewIndex = Mn.View.extend({

        template: _.template(templateIntro),

        initialize: function() {
            $(window).on("resize", this.updateCurrentImg);
        },

        onAttach: function() {
            $('#nextImg_btn').innerHeight($("#divCarousselPromo").innerHeight());
            $('#prevImg_btn').innerHeight($("#divCarousselPromo").innerHeight());
            $('#current_img').innerHeight($("#divCarousselPromo").innerHeight());




            $('#divCarousselPromo').find('.full-width').find('div').css("max-height", ($("#divCarousselPromo").innerHeight())+"px");
            setHeaderFooterVisible(true, true);

            $("#divCarousselPromo").caroussel({
                callbackChangeStep: function(step) {
                    $(".spanStepIndicator").css("color", "white");
                    $(".spanStepIndicator[data-step='" + step + "']").css("color", "red");
                }
            });

            // Todo : déterminer le genre principal

            //Genre de imdb
            var genres =  $.ajax({
                method: "GET",
                url: getConfiguration("url-server") + "/genres/movies",
                cache: false,
                success: function(message) {
                    var allMovieGenres = message.imdb.genres;
                    var idsGenre = [];
                    for(i = 0; i < allMovieGenres.length; i++){
                        idsGenre.push(allMovieGenres[i].id)
                    }

                    var randGenre = idsGenre[Math.floor(Math.random()*idsGenre.length)];
                    // nouveau test random sur les genre
                    //Test with genre: drama (id 18 dans imdb)
                    //Get random movies in given genre
                    $.ajax({
                        method: "GET",
                        url: getConfiguration("url-server") + "/discover/movie?genre=" + randGenre,
                        cache: false,
                        success: function(message) {
                            console.log(message);
                            var arrayMovie = [];
                            var arrayIndex = [];
                            while(arrayMovie.length != 6){
                                var randomIndex = Math.floor(Math.random() * message.imdb.length);
                                if($.inArray(randomIndex, arrayIndex) == -1){
                                    if(message.imdb[randomIndex].title != "undefined"){
                                        arrayIndex.push(randomIndex);
                                        var randomMovie = message.imdb[randomIndex];
                                        arrayMovie.push(randomMovie);

                                    }
                                }
                            }
                            adaptImage(0, arrayMovie[4].backdrop_path, arrayMovie[4].title, arrayMovie[4].overview, arrayMovie[4].id);
                            adaptImage(1, arrayMovie[5].backdrop_path, arrayMovie[5].title, arrayMovie[5].overview, arrayMovie[5].id);
                            adaptImage(2, arrayMovie[0].backdrop_path, arrayMovie[0].title, arrayMovie[0].overview, arrayMovie[0].id);
                            adaptImage(3, arrayMovie[1].backdrop_path, arrayMovie[1].title, arrayMovie[1].overview, arrayMovie[1].id);
                            adaptImage(4, arrayMovie[2].backdrop_path, arrayMovie[2].title, arrayMovie[2].overview, arrayMovie[2].id);
                            adaptImage(5, arrayMovie[3].backdrop_path, arrayMovie[3].title, arrayMovie[3].overview, arrayMovie[3].id);
                            adaptImage(6, arrayMovie[4].backdrop_path, arrayMovie[4].title, arrayMovie[4].overview, arrayMovie[4].id);
                            adaptImage(7, arrayMovie[5].backdrop_path, arrayMovie[5].title, arrayMovie[5].overview, arrayMovie[5].id);
                            adaptImage(8, arrayMovie[0].backdrop_path, arrayMovie[0].title, arrayMovie[0].overview, arrayMovie[0].id);
                            adaptImage(9, arrayMovie[1].backdrop_path, arrayMovie[1].title, arrayMovie[1].overview, arrayMovie[1].id);

                        },
                        error: function(message) {
                        },
                        complete: function() {
                        }
                    });
                },
                error: function(message) {
                },
                complete: function() {
                }
            });

        },

        updateCurrentImg: function(){
            if($(window).width() < 370){
                resizeLogo();
            }
            else{
                resetLogo()
            }
            $('#current_img').innerWidth($('#first_img').width());
            $('#divCarousselPromo').find('.full-width').find('div').css("max-height", ($("#divCarousselPromo").innerHeight())+"px");
        },

        onDomRefresh: function(){
            $('#current_img').innerWidth($('#first_img').width());
            $("#divCarousselPromo").data("caroussel-step", 2);
            var translateX = "-"+100/(($("#divCarousselPromo").children().index($("#last_img")))-2)+"%";
            $("#divCarousselPromo").css('transform', 'translate('+translateX+', 0)');
            observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutationRecord) {
                    var interval = setInterval(function(){
                        var minCurrentImg =  ($('#current_img').offset().left);
                        var maxCurrentImg =  $('#current_img').offset().left +$('#current_img').innerWidth();

                        $('#divCarousselPromo').children().each(function (){
                            if($(this).offset().left == minCurrentImg && ($(this).offset().left + $(this).innerWidth()) == maxCurrentImg){

                                var indexCurrent = $("#divCarousselPromo").find($(this)).index();
                                var indexLast = $("#divCarousselPromo").find($('#last_img')).index();
                                setCurrentImg(indexCurrent, false, false);

                                if(indexCurrent == indexLast+1){
                                    loopToImg(2, indexLast + 1);
                                }
                                if(indexCurrent == 1){
                                    loopToImg(indexLast, 1);
                                }
                                clearInterval(interval);
                            }

                        });

                    }, 0.1);

                });
            });

            var target = document.getElementById('divCarousselPromo');
            observer.observe(target,{attributes:true, attributeFilter:['style']});
        },

        events: {
            'mousedown #divCarousselPromo': 'dragCarousel',
            'mouseup #divCarousselPromo': 'stopDragCarousel',
            'mouseenter #nextImg_btn': 'glowNextImg',
            'mouseleave #nextImg_btn': 'glowOutNextImg',
            'mouseenter #prevImg_btn': 'glowPrevImg',
            'mouseleave #prevImg_btn': 'glowOutPrevImg',
            'click #nextImg_btn': 'goToNextImg',
            'click #prevImg_btn': 'goToPrevImg',
            'click .btnDetail' : 'goToMoviePage',

        },

        goToMoviePage: function(event){
            var movieId = event.target.getAttribute('id');
            var movieName = event.target.getAttribute('name');
            observer.disconnect();
            setTimeout(function() {
                location.href='#movies/view/'+movieId+'?name='+movieName;
            }, 20);
        },


        dragCarousel: function(e){
            $('#divCarousselPromo').css('cursor', '-webkit-grabbing');

        },

        stopDragCarousel: function(e){
            $('#divCarousselPromo').css('cursor', '-webkit-grab');

        },

        glowNextImg: function(){
            $('.next_img').addClass('next_img_hover');
        },

        glowOutNextImg: function(){
            $('.next_img').removeClass('next_img_hover');
        },

        glowPrevImg: function(){
            $('.prev_img').addClass('prev_img_hover');
        },

        glowOutPrevImg: function(){
            $('.prev_img').removeClass('prev_img_hover');
        },

        goToNextImg:function(){
            observer.disconnect();
            var currentImg = $("#divCarousselPromo").children().index($('.currentImg'));
            var indexNextImg = currentImg + 1;

            if(currentImg == $("#divCarousselPromo").children().index($("#last_img"))){
                indexNextImg = 1;
                loopToImg(indexNextImg, $("#divCarousselPromo").children().index($("#last_img")));
                setCurrentImg(2, true, false);
                setTimeout(function() {
                    translateImg(2, 0.4);
                    var target = document.getElementById('divCarousselPromo');
                    observer.observe(target,{attributes:true, attributeFilter:['style']});
                }, 20);
            }
            else{
                setCurrentImg(indexNextImg, true, false);
                translateImg(indexNextImg, 0.4);
            }
            if(indexNextImg != 1){
                var target = document.getElementById('divCarousselPromo');
                observer.observe(target,{attributes:true, attributeFilter:['style']});
            }

        },

        goToPrevImg:function(){
            observer.disconnect();
            var indexLast = $("#divCarousselPromo").children().index($('#last_img'));
            var currentImg = $("#divCarousselPromo").children().index($('.currentImg'));
            var indexPrevImg = currentImg - 1;

            if(currentImg == 2){
                indexPrevImg = indexLast + 1;
                loopToImg(indexPrevImg, 2);
                setCurrentImg(indexLast, false, true);
                setTimeout(function() {
                    translateImg(indexLast, 0.4);
                    var target = document.getElementById('divCarousselPromo');
                    observer.observe(target,{attributes:true, attributeFilter:['style']});
                }, 20);
            }
            else{
                setCurrentImg(indexPrevImg, false, true);
                translateImg(indexPrevImg, 0.4);
            }

            if(indexPrevImg != indexLast + 1){
                var target = document.getElementById('divCarousselPromo');
                observer.observe(target,{attributes:true, attributeFilter:['style']});
            }

        }

    });

    var setCurrentImg = function(index_currentImg, hover_next, hover_prev){
        removeAllClassesImg(index_currentImg);
        $($("#divCarousselPromo").children()[index_currentImg]).addClass('currentImg');
        setPrevImg(index_currentImg, hover_prev);
        setNextImg(index_currentImg, hover_next);
    }

    var setNextImg = function(index_currentImg, hover){
        removeAllClassesImg(index_currentImg +1);
        $($("#divCarousselPromo").children()[index_currentImg +1]).addClass('next_img');

        if(hover){
            $($("#divCarousselPromo").children()[index_currentImg +1]).addClass('next_img_hover');
        }
    }

    var setPrevImg = function(index_currentImg, hover){
        removeAllClassesImg(index_currentImg - 1);
        $($("#divCarousselPromo").children()[index_currentImg -1]).addClass('prev_img');

        if(hover){
            $($("#divCarousselPromo").children()[index_currentImg -1]).addClass('prev_img_hover');
        }
    }

    var loopToImg = function(index_img_toLoopTo, index_img_toLoopFrom)  {
        removeAllClassesImg(index_img_toLoopTo);
        removeAllClassesImg(index_img_toLoopFrom);
        removeAllClassesImg(index_img_toLoopFrom +1);
        translateImg(index_img_toLoopTo, 0);
    }

    var removeAllClassesImg = function(index_img){
        $($("#divCarousselPromo").children()[index_img]).removeClass('prev_img');
        $($("#divCarousselPromo").children()[index_img]).removeClass('next_img');
        $($("#divCarousselPromo").children()[index_img]).removeClass('prev_img_hover');
        $($("#divCarousselPromo").children()[index_img]).removeClass('next_img_hover');
        $($("#divCarousselPromo").children()[index_img]).removeClass('currentImg');
    }

    var translateImg = function(index, duration){
        var translateX = "-" + 100 / (($("#divCarousselPromo").children().index($("#last_img"))) + 3)*index + "%";
        document.getElementById("divCarousselPromo").style.transition = duration+"s";
        document.getElementById("divCarousselPromo").style.transform = "translate(" + translateX + ",0)";
        $("#divCarousselPromo").data("caroussel-step", index);
    }

    function adaptImage(numImg, urlImg, nameMovie, descriptionMovie, idMovie){
        $('#divCarousselPromo').find('.full-width')[numImg].style["background-image"] = "url('"+urlImg+"')";
        $('#divCarousselPromo').find('.full-width')[numImg].style["background-position"] = "center";
        $('#divCarousselPromo').find('.full-width')[numImg].style["background-size"] = "cover";
        $('#divCarousselPromo').find('.full-width')[numImg].style["align-self"] = "stretch";
        $('#divCarousselPromo').find('h1')[numImg].append(nameMovie);
        $('#divCarousselPromo').find('p')[numImg].append(descriptionMovie);
        $($('#divCarousselPromo').find('button')[numImg]).attr('id', idMovie);
    }

    return ViewIndex;

});