define([
    "backbone.marionette",
    "waves",
    "text!templates/templateSignUp.html",
], function (Mn, Waves, templateSignUp) {

    var ViewSignUp = Mn.View.extend({

        template: _.template(templateSignUp),

        onRender: function () {
            hideHeader();
        },

        events: {
            "click #btnSignUp" : "signUp"
        },

        validateSignUp: function() {
            $('#divError').html("");
            if ($('#password').val === '' || $('#confirmPassword').val() === '') {
                $('#divError').html("You need to enter a password and confirm it.");
                return false;
            } else if ($('#password').val() !== $('#confirmPassword').val()) {
                $('#divError').html("The two password are not the same.");
                return false;
            } else if ($('#name').val() === '') {
                $('#divError').html("You need to enter your name.");
                return false;
            } else if (!validateEmail($('#email').val())) {
                $('#divError').html("You need to enter a valid email.");
                return false;
            } else {
                return true;
            }
        },

        signUp: function() {
            if (this.validateSignUp()) {
                $('#btnSignUp').attr('disabled', true);
                var name = $('#name').val();
                var email = $('#email').val();
                var password = $('#password').val();

                $.ajax({
                    method: "POST",
                    url: getConfiguration("url-server") + "/signup",
                    data: {
                        name: name,
                        email: email,
                        password: password
                    },
                    success: function(response) {
                        signIn(email, password);
                    },
                    error: function(response) {
                        $('#divError').html("This email is already taken, try an other email.");
                        $('#btnSignUp').attr('disabled', false);
                    }
                });
            }
        }
    });

    return ViewSignUp;
});
