define([
    "backbone.marionette",
    "waves",
    "text!templates/templateSignIn.html",
], function (Mn, Waves, templateSignIn) {

    var ViewSignIn = Mn.View.extend({

        template: _.template(templateSignIn),

        onRender: function () {
            hideHeader();
        },

        events: {
            'click #btnConnect': 'login'
        },

        login: function(){
            $('#btnConnect').attr('disabled', true);
            var email = $('#email').val();
            var password = $('#password').val();
            if (validateEmail(email) && password !== '') {
                signIn(email,password);
            } else if (!validateEmail(email)){
                $('#divError').html('You need to enter a valid email.');
            } else if (password === '') {
                $('#divError').html('You need to enter a password.');
            }
            $('#btnConnect').attr('disabled', false);
        },

    });
    return ViewSignIn;
});
