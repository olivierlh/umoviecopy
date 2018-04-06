(function($) {
    
    $.fn.caroussel = function(options) {
        
        var options = options || {};
        var threshold = 16;
        
        var numberOfChildren = this.children(":not(.caroussel-ignore)").length;
    
        this.css("transition", "transform 0.4s ease")
            .css("display", "flex")
            .css("width", 100 * numberOfChildren + "%")
            .css("min-width", 100 * numberOfChildren + "%")
            .data("caroussel-children", numberOfChildren)
            .data("caroussel-step", "0")
            .parent().css("overflow-x", "hidden");
            
        var hammertime = new Hammer(this[0]);
        hammertime.get("pan").set({threshold: threshold});
        
        hammertime.on("panstart", (function(event) {
            this.css("transition", "none");
        }).bind(this));
        
        hammertime.on("pan", (function(event) {
            event.preventDefault();
            var step = parseInt(this.data("caroussel-step"));
            var children = parseInt(this.data("caroussel-children"));
            var transform;
            if ((step == 0 && event.deltaX > 0)
                || (step == children - 1 && event.deltaX < 0)) {
                transform = "translateX(" + (-100 / children) * step + "%)";
            } else {
                var delta = event.deltaX;
                if (delta > 0) {
                    delta -= threshold;
                } else {
                    delta += threshold;
                }
                transform = "translateX(calc(" + (-100 / children) * step + "% " + (delta < 0 ? "-" : "+") + " " + Math.abs(delta) + "px))";
            }
            this.css("transform", transform);
        }).bind(this));
        
        hammertime.on("panend", (function(event) {
            this.css("transition", "transform 0.4s ease")
            var step = parseInt(this.data("caroussel-step"));
            var children = parseInt(this.data("caroussel-children"));
            if (event.deltaX >= 60 && step > 0) {
                step--;
            } else if (event.deltaX <= -60 && step < children - 1) {
                step++;
            } else {
                this.css("transform", "translateX(" + (-100 / children) * step + "%)");
                return;
            }
            this.carousselChangeStep(step);
        }).bind(this));
        
        this.on("caroussel:changeStep", function(event, step) {
            if (options.callbackChangeStep) {
                options.callbackChangeStep(step);
            }
        });
        
    };
    
    $.fn.carousselChangeStep = function(step) {
        var children = parseInt(this.data("caroussel-children"));
        if (step >= children) {
            return false;
        }
        this.data("caroussel-step", step);
        this.css("transform", "translateX(" + (-100 / children) * step + "%)");
        this.trigger("caroussel:changeStep", step);
        return true;
    };
    
})(jQuery);

