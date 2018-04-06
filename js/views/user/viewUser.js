define([
    "backbone.marionette",
    "text!templates/user/templateUserBase.html",
    "text!templates/user/templateUserProfil.html",
    "text!templates/user/templateUserWatchlist.html",
    "text!templates/user/templateUserWatchlistModal.html"
], function (Mn, TemplateUserBase, TemplateUserProfil, TemplateUserWatchlist, TemplateModal) {

    var ViewUser = Mn.View.extend({
        template: _.template(TemplateUserBase),

        onAttach: function () {
            console.log("ok");
            setHeaderFooterVisible(true, false);
            var id = this.options.userId;
            var showBtn = true;
            if (id === 'profile') {
                id = getConfiguration('user_id');
            }
            this.isFollowed = false;
            $.ajax({
                context: this,
                method: "GET",
                url: getConfiguration("url-server") + "/users/" + id,
                cache: false,
                success: function (response) {
                    console.log(response);
                    if (response.id === getConfiguration('user_id')) {
                        showBtn = false;
                    }
                    response['picture'] = fetchImageFromGravatar(response.email);
                    this.userInfo = response;
                    var compiledTemplate = _.template(TemplateUserProfil);
                    $("#divUser").prepend(compiledTemplate({
                        data: response,
                        addBtnFollow: showBtn
                    }));
                },
                error: function(response) {
                    console.log(response);
                }
            });
            that = this;
            setTimeout(function() {
                $.ajax({
                    context: that,
                    method: "GET",
                    url: getConfiguration("url-server") + "/users/" + getConfiguration('user_id'),
                    cache: false,
                    success: function (response) {
                        for (var i = 0; i < response.following.length; i++) {
                            if (response.following[i].id === that.userInfo.id) {
                                that.isFollowed = true;
                                return true;
                            }
                        }
                    },
                    error: function(response) {
                        console.log(response);
                    }
                });
            }, 0);
            $.ajax({
                context: this,
                method: "GET",
                url: getConfiguration("url-server") + "/watchlists",
                cache: false,
                success: function(response) {
                    this.arrayWatchlists = [];
                    for (var i = 0; i < response.length; i++) {
                        if (response[i].owner && response[i].owner.id == this.userInfo.id) {
                            this.arrayWatchlists.push(response[i]);
                        }
                    }
                    $("#divWatchlistsUser").prepend(_.template(TemplateUserWatchlist)({watchlists: this.arrayWatchlists}));
                },
                error: function(response) {
                },
                complete: function() {
                }
            });
        },
        events: {
            "click #btnFollowUnfollowIt" : "followUnfollowAction",
            "click .userRow" : "showOtherUser",
            "click .watchlistRow": "showWatchlist"
        },

        showOtherUser: function(e) {
           var id = $(e.currentTarget).data('id');
           Backbone.history.navigate('users/' + id, {trigger: true});
        },

        showWatchlist: function(e) {
            var id = $(e.currentTarget).data('id');
            var position = 0;
            for (var i = 0; i < this.arrayWatchlists.length; i++) {
                if (this.arrayWatchlists[i].id == id) {
                    position = i;
                }
            }
            that = this;
            console.log(this.arrayWatchlists[position]);
            $("#modalWatchlist").empty().prepend( _.template(TemplateModal)({
                info: that.arrayWatchlists[position]
            }));
            $('#modalWatchlist').modal();
            setTimeout(function() {

            },0);

        },

        followUnfollowAction: function() {
            that = this;
            setTimeout(function() {
                if (that.isFollowed) {
                    that.unfollowIt();
                } else {
                    that.followIt();
                }
            },0);
        },
        unfollowIt: function() {
            $.ajax({
                context: this,
                method: "DELETE",
                url: getConfiguration('url-server') + "/follow/" + this.options.userId,
                cache: false,
                success: function(response) {
                    this.isFollowed = false;
                    showAffirmation('Success', 'You are no longer following this user.');
                }
            });
        },
        followIt: function() {
            $.ajax({
                context: this,
                method: "POST",
                url: getConfiguration('url-server') + "/follow",
                data: JSON.stringify({
                    id: this.options.userId
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

    });

    return ViewUser;
});