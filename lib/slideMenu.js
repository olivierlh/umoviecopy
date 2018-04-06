(function($) {
    
    var id = 1;
    
    $.fn.slideMenu = function(options) {
        
        var options = options || {};
        var position = options.position || "left";
        
        this.css("transition", "transform 0.4s ease")
            .css("position", "fixed")
            .css("z-index", 2)
            .data("slide-state", "out")
            .data("slide-transition", false)
            .data("slide-id", id);
        id++;
        
        if (position == "left") {
            this.css("left", 0).css("transform", "translateX(-100%)");
        } else if (position == "right") {
            this.css("right", 0).css("transform", "translateX(100%)");
        } else {
            console.log("Unknown position given.");
        }
        this.data("slide-position", position);
        
        this.on("transitionend", (function() {
            this.data("slide-transition", false);
        }).bind(this));
        
        var hammertime = new Hammer(this[0]);
        hammertime.get("pan").set({direction: Hammer.DIRECTION_ALL});
        
        hammertime.on("panstart", (function(event) {
            this.css("transition", "none");
            this.data("slide-allowed", event.direction == Hammer.DIRECTION_LEFT || event.direction == Hammer.DIRECTION_RIGHT);
        }).bind(this));
        
        hammertime.on("pan", (function(event) {
            if (!this.data("slide-allowed")) {
                return;
            }
            event.preventDefault();
            if (this.data("slide-state") == "in") {
                var transform = "translateX(" + event.deltaX + "px)";
                if ((this.data("slide-position") == "left" && event.deltaX > 0)
                    || (this.data("slide-position") == "right" && event.deltaX < 0)) {
                    transform = "translateX(0%)";
                }
                this.css("transform", transform);
            }
        }).bind(this));
        
        hammertime.on("panend", (function(event) {
            this.css("transition", "transform 0.4s ease");
            if (!this.data("slide-allowed")) {
                return;
            }
            this.css("transform", "translateX(0%)");
            if ((this.data("slide-position") == "left" && event.deltaX <= -60)
                || (this.data("slide-position") == "right" && event.deltaX > 60)) {
                this.slideMenuToggle();
            }
        }).bind(this));
        
        var div = $("<div/>");
        div.css("position", "absolute")
            .css("display", "none")
            .css("top", "0px")
            .css("left", "0px")
            .css("z-index", 1)
            .addClass("full-width full-height divSlideOverlay")
            .css("background-color", "black")
            .css("opacity", "0.5")
            .attr("data-slide-menu", this.data("slide-id"));
        $("body").append(div);
        
        div.on("click", (function() {
            this.slideMenuToggle();
        }).bind(this));
        
        this.on("click", "a", (function() {
            setTimeout((function() {
                this.slideMenuToggle();
            }).bind(this), 100);
        }).bind(this));
        
        this.on("destroyed", function() {
            div.fadeOut(0.4, function() {
                div.remove();
            });
        });
        
        var toggles = options.toggles || [];
        var toggle;
        for (var index in toggles) {
            toggle = toggles[index];
            $(toggle).on("click", (function() {
                this.slideMenuToggle();
            }).bind(this));
        }
        
        return this;
        
    };
    
    $.fn.slideMenuToggle = function() {
        
        if (this.data("slide-transition")) {
            return;
        }
        
        var state = this.data("slide-state");
        var position = this.data("slide-position");
        
        if (position == "left") {
            if (state == "out") {
                this.css("transform", "translateX(0%)");
                this.data("slide-state", "in");
                $(".divSlideOverlay[data-slide-menu=\"" + this.data("slide-id") + "\"]").fadeIn();
            } else {
                this.css("transform", "translateX(-100%)");
                this.data("slide-state", "out");
                $(".divSlideOverlay[data-slide-menu=\"" + this.data("slide-id") + "\"]").fadeOut();
            }
        } else if (position == "right") {
            if (state == "out") {
                this.css("transform", "translateX(0%)");
                this.data("slide-state", "in");
                $(".divSlideOverlay[data-slide-menu=\"" + this.data("slide-id") + "\"]").fadeIn();
            } else {
                this.css("transform", "translateX(100%)");
                this.data("slide-state", "out");
                $(".divSlideOverlay[data-slide-menu=\"" + this.data("slide-id") + "\"]").fadeOut();
            }
        }
        
        this.data("slide-transition", true);
        
    };
    
    $.event.special.destroyed = {
        remove: function(o) {
            if (o.handler) {
                o.handler()
            }
        }
    }
    
})(jQuery);
