function setConfiguration(name, value) {
    if (localStorageAvailable()) {
        var localConfig = JSON.parse(localStorage.getItem("config"));
        if (!localConfig) {
            localConfig = {};
        }
        localConfig[name] = value;
        localStorage.setItem("config", JSON.stringify(localConfig));
    } else {
        if (!window.globalStorage) {
            window.globalStorage = {};
        }
        window.globalStorage[name] = value;
    }
}

function getConfiguration(name) {
    if (localStorageAvailable()) {
        var localConfig = JSON.parse(localStorage.getItem("config"));
        if (localConfig && typeof localConfig[name] != "undefined") {
            return localConfig[name];
        }
    } else {
        if (window.globalStorage && window.globalStorage[name]) {
            return window.globalStorage[name];
        }
    }
    return null;
}

function localStorageAvailable() {
    if (typeof window.localStorage === "undefined" || typeof localStorage === "undefined") {
        return false;
    }
    try {
        localStorage.setItem("test", "test");
        localStorage.removeItem("test");
        return true;
    } catch (e) {
        return false;
    }
}

function unwrapView(view) {
    view.$el = view.$el.children();
    view.$el.unwrap();
    view.setElement(view.$el);
}

function validateNotEmpty(input) {
    return input.length > 0;
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validatePassword(field, value) {
    var password = field.split('_');
    var passwordId = password[1];
    if ( $('#'+passwordId).val() !=  value) {
        return false;
    }
    return true;
}

function GET(key) {
    var url = Backbone.history.getFragment();
    if (url.indexOf("?") == -1) {
        return null;
    }
    url = url.substring(url.indexOf("?") + 1, url.length);
    var split = url.split("&");
    for (var i = 0; i < split.length; i++) {
        var pair = split[i].split("=");
        if (pair[0] == key) {
            return {
                key: pair[0],
                value: pair.length > 1 ? pair[1] : null
            };
        }
    }
    return null;
}
