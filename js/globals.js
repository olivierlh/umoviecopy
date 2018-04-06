function showAffirmation(title, message, callback) {
    $("#modalAffirmation .modal-header h3").html(title);
    $("#modalAffirmation .modal-body").html(message);
    $("#modalAffirmation").modal("show");
    $("#modalAffirmation button").off("click").on("click", function () {
        $("#modalAffirmation").modal("hide");
        $('#modalAffirmation').find('video');
        if($('video')[0] !== undefined){$('video')[0].load();}
    });
    $('#modalAffirmation').on('hidden.bs.modal', function () {
        if($('video')[0] !== undefined){$('video')[0].load();}
    })

}

function showConfirmation(title, message, yesCallback, noCallback) {
    $("#modalConfirmation .modal-header h4").html(title);
    $("#modalConfirmation .modal-body").html(message);
    $("#modalConfirmation button.btnYes").off("click").on("click", function () {
        if (yesCallback) {
            yesCallback();
        }
        $("#modalConfirmation").modal("hide");
    });
    $("#modalConfirmation button.btnNo").off("click").on("click", function () {
        if (noCallback) {
            noCallback();
        }
        $("#modalConfirmation").modal("hide");
    });
    $("#modalConfirmation").modal("show");
}

// Todo : transféré dans viewMovie.
function showConfirmation_addToWatchlist(message, movieId, yesCallback, noCallback) {
    $("#modalConfirmation_addToWatchList .modal-body").html(message);
    $("#btnConfirmAddMovie").off("click").on("click", function () {
        $.ajax({
            method: "GET",
            url: getConfiguration("url-server") + "/movies/" + movieId,
            cache: false,
            success: function (data) {
                if (data !== undefined) {
                    console.log(data.imdb.genres);
                    $.ajax({
                        method: "POST",
                        url: getConfiguration("url-server") + "/watchlists/" + $("input[name=watchlist]:checked").val() + "/movies",
                        data: data.imdb,
                        cache: false,
                        success: function (message) {
                            showAffirmation('Success','You add this movie to the watchlist selected!')
                        },
                        error: function (message) {
                        },
                        complete: function () {
                        }
                    });
                }
            },
            error: function (data) {
            },
            complete: function () {
            }
        });


        if (yesCallback) {
            yesCallback();
        }
        $("#modalConfirmation_addToWatchList").modal("hide");
    });

    $("#modalConfirmation_addToWatchList").modal("show");
}

function setConnected(connected, data) {
    if (connected) {
        setConfiguration('token', data.token);
        setConfiguration('user_id', data.id);
        setConfiguration('user_email', data.email);
        setConfiguration('user_name', data.name);

        $('#slideMenuUserName').html(data.name);
        $('#slideMenuEmailAddress').html(data.email);
        updateSideMenuPicture(fetchImageFromGravatar(data.email));
    } else {
        setConfiguration("token", null);
        setConfiguration('user_id', null);
        setConfiguration('user_email', null);
        setConfiguration('user_name', null);
    }
}

function fetchImageFromGravatar(email) {
    var hashMail = MD5((email).toLowerCase());
    return $grav_url = "https://www.gravatar.com/avatar/" + hashMail + "?s=280&d=mm";

}

function updateSideMenuPicture(url) {
    $('#profilePictureSlideMenu').css('background-image', "url('" + url + "')");
}

function isConnected() {
    return getConfiguration("token") ? true : false;
}

function showHeader() {
    $("#divNavbar").show();
    $("#divRegionMainContainer").addClass("headerVisible");
}

function hideHeader() {
    $("#divNavbar").hide();
    $("#divRegionMainContainer").removeClass("headerVisible");
}

function showFooter() {
    $("#divFooter").show();
    $("#divRegionMainContainer").addClass("footerVisible");
}

function hideFooter() {
    $("#divFooter").hide();
    $("#divRegionMainContainer").removeClass("footerVisible");
}

function signIn(email, password) {

    $.ajax({
        method: "POST",
        url: getConfiguration("url-server") + "/login",
        data: {
            email: email,
            password: password
        },
        success: function(response) {
            setConnected(true, response);

            showSpinner();
            Backbone.history.navigate("index", {trigger: true, replace: true});
        },
        error: function(response) {
            console.log("Error.");
            $('#divError').html("The email and/or the password are wrong. Please try again.");
            console.log(response);
        }
    });
}

function setHeaderFooterVisible(headerVisible, footerVisible) {
    if (headerVisible) {
        showHeader();
    } else {
        hideHeader();
    }
    if (footerVisible) {
        showFooter();
    } else {
        hideFooter();
    }
}

function showSpinner() {
    $(".toSvg").toSvg();
    $('#loader_page').show();
    setTimeout(function () {
        hideSpinner();
    }, 3000);
}

function hideSpinner() {
    $('#loader_page').hide();
}


function resizePage() {
    $('.card').css("width", ($(window).width() - 20) + "px");
    $('.moviePicture').css("width", $('.card').innerWidth() - 60);
    $('.moviePicture').css("height", ($('.card').innerWidth() - 60) * 1.5);
    //$('.moviePicture').css("height", ($('.card').innerWidth() - 60) * 1.50);
}

function resetPage() {
    $('.card').css("width", "");
    $('.moviePicture').css("width", 330 + "px");
    $('.moviePicture').css("height", 500 + "px");
    //$('.moviePicture').css("height", "");
}


function toggleClass_DescriptionText() {
    if ($(window).width() > 760) {
        setClass_DescriptionText();
    }
    else {
        $('.pictureDescription').css("display", "inline-block");
    }
}

function setClass_DescriptionText() {
    if ($('.descriptionText').innerHeight() >= 460) {
        $('.pictureDescription').css("display", "inline-block");
    }
    else {
        $('.pictureDescription').css("display", "flex");
    }
}

function resizePicture() {
    var sizePicture = (($('.actorMovies').find('.row').innerWidth()) / 3) - 2 * 8;
    $('.moviePictureActor').css({"height": sizePicture * 3/2 + "px", "width": sizePicture + "px"});
}

function resetPicture() {
    $('.moviePictureActor').css({"height": "135px", "width": "90px"});
}

function resizeLogo() {
    $(".marginLogo").find('img').css("width", "30%");
    $(".marginLogo").find('img').css("height", $(".marginLogo").find('img').innerWidth() / 1.65 + "px");
}

function resetLogo() {
    $(".marginLogo").find('img').css("width", "130.016px");
    $(".marginLogo").find('img').css("height", "64px");
}

function resizeToMedium_AddWatchList_btn() {
   // $("#addToWatchList_div").addClass("mediumAddWatchList_btn");
   // $("#addToWatchList_div").find('p').addClass("btnAddToWatchList_text_medium");
   // $("#addToWatchList_div").css("height", $("#addToWatchList_div").innerWidth() / 5 + "px");
}
function resizeToSmall_AddWatchList_btn() {
   // $("#addToWatchList_div").addClass("smallAddWatchList_btn");
   // $("#addToWatchList_div").find('p').addClass("btnAddToWatchList_text_small");
}

function resetToMedium_AddWatchList_btn() {
   // $("#addToWatchList_div").removeClass("smallAddWatchList_btn");
   // $("#addToWatchList_div").find('p').removeClass("btnAddToWatchList_text_small");
}

function resetToNormal_AddWatchList_btn() {
    // $("#addToWatchList_div").removeClass("mediumAddWatchList_btn");
    // $("#addToWatchList_div").find('p').removeClass("btnAddToWatchList_text_medium");
}