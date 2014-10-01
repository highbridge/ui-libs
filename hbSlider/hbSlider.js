/*
 * hbSlider -- HighBridge Slider
 *
 */

(function($)
{
    var Slider = function(options)
    {
        var slider = this;
        
        // Ensure a pane is set as current on load
        if($(this).find('.touch-pane.current').length == 0)
            $(this).find('.touch-pane').eq(0).addClass('current');

        // When resize is triggered
        $(window).on('resize', function()
        {
            // First clear any previous styles set on the slider
            $(slider).removeAttr('style');
            
            // Loop through all panes and set the container height to their size
            $(slider).find('.touch-pane').each(function()
            {
                $(this).css('height', 'auto');
                var parent = $(slider);

                if($(this).outerHeight(true) > parent.outerHeight(true))
                {
                    parent.height($(this).outerHeight(true));
                }

                $(this).css('height', '100%');
            });
        });

        // Trigger resize on load to ensure everything is positioned properly
        $(window).trigger('resize');
        
        // Convenience event for going to the next pane
        $(this).on('slide-next', function()
        {
            var current = $(this).find('.touch-pane.current');
            var index = current.index();

            var next = index + 1;

            if(next >= $(this).find('.touch-pane').length)
                next = 0;

            $(this).trigger('slide-to', next);
        });

        // Convenience event for going to the previous pane
        $(this).on('slide-prev', function()
        {
            var current = $(this).find('.touch-pane.current');
            var index = current.index();

            var prev = index - 1;

            $(this).trigger('slide-to', {index: prev, direction: 'right'});
        });

        // Allows sliding to any pane based on its index
        $(this).on('slide-to', function(event, request)
        {
            var slide = {index: 0, direction: 'left'};

            // If our request is an object
            if(typeof request == "object") $.extend(slide, request);
            // Else if the request is simply a number
            if(request == parseInt(request))   slide.index = request;
            
            // Find index
            var to = $(this).find('.touch-pane').eq(slide.index);

            // Find current element
            var from = $(this).find('.touch-pane.current');

            // Make sure we're actually going somewhere
            // Also make sure we're not already animating
            if(to.index() != from.index() && !to[0].dataset.to && !from[0].dataset.from)
            {
                var distance = $(this).width();

                // If we're sliding to a previous image, negate the distance
                if(slide.direction == 'right') distance *= -1;

                transform(to, 'translate('+distance+'px, 0px)', 'translate(0px, 0px)');
                transform(from, 'translate(0px, 0px)', 'translate('+(distance * -1)+'px, 0px)');

                to[0].dataset.to = true;
                from[0].dataset.from = true;

                if(typeof options != "undefined" && typeof options.slideStart == "function") options.slideStart(this, slide);
            }
        });

        // Helper function to handle transformations
        function transform(element, prop_from, prop_to)
        {
            element.removeClass('active-transition');
            element.removeAttr('style');

            element.addClass('init-transition');
            element.css({'transform': prop_from});
            element[0].dataset.transform = prop_to;
        }
        
        // Called when a transition is set to its initial position
        $(this).on('webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd', '.init-transition', function(event)
        {
            $(this).removeClass('init-transition');
            $(this).addClass('active-transition');
            $(this).css({'transform': this.dataset.transform});
            delete(this.dataset.transform);
        });

        // Called when a transition is actually completed
        $(this).on('webkitTransitionEnd transitionend msTransitionEnd oTransitionEnd', '.active-transition', function()
        {
            $(this).removeClass('active-transition');
            $(this).removeAttr('style');

            if(this.dataset.to)
            {
                $(this).addClass('current');
                delete(this.dataset.to);
            }

            if(this.dataset.from)
            {
                $(this).removeClass('current');
                delete(this.dataset.from);
            }

            if(typeof options != "undefined" && typeof options.slideEnd == "function") options.slideEnd(this);
        });
    };
    
    $.fn.hbSlider = function(options)
    {
        for(var i = 0, l = this.length; i < l; i++)
        {
            Slider.call(this[i], options);
        }
    };
})(jQuery);
