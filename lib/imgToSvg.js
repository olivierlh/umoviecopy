// http://stackoverflow.com/questions/11978995/how-to-change-color-of-svg-image-using-css-jquery-svg-image-replacement
(function($) {
    $.fn.toSvg = function() {
        $.each(this, function(key, value) {
            var img = $(this);
            var imgId = img.attr("id");
            var imgClass = img.attr("class");
            var imgSrc = img.attr("src");
            var imgWidth = img.attr("width");
            var imgHeight = img.attr("height");
            var imgStyle = img.attr("style");
            $.ajax({
                method: "GET",
                url: imgSrc,
                dataType: "xml",
                success: function(message) {
                    var svg = $(message).find("svg");
                    if (imgId) {
                        svg.attr("id", imgId);
                    }
                    if (imgClass) {
                        svg.attr("class", imgClass);
                    }
                    if (imgWidth) {
                        svg.attr("width", imgWidth);
                    }
                    if (imgHeight) {
                        svg.attr("height", imgHeight);
                    }
                    if (imgStyle) {
                        svg.attr("style", imgStyle);
                    }
                    svg.removeAttr('xmlns:a');
                    img.replaceWith(svg);
                }
            });
        });
    }
})(jQuery);
