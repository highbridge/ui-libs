/*
 * hbSlider -- HighBridge Slider
 *
 */

(function($)
{
    /*************************
     * 
     *  Helper functions
     * 
     ************************/

    // Initialize slider
    function init(slider)
    {
        // Ensure a pane is set as current on load
        if($(slider).find('.slide-pane.current').length == 0)
            $(slider).find('.slide-pane').eq(0).addClass('current active');

        var offset = $(slider).find('.slide-pane').eq(0).outerWidth(true);

        // Determine visible panes
        for(var i = 1, l = slider.options.display; i < l; i++)
        {
            var pane = $(slider).find('.slide-pane').eq(i);
            
            TweenLite.set(pane[0], {x: offset+'px'});
            offset += pane.outerWidth(true);

            pane.addClass('active');
        }
    }

    function calculate_duration(slider, distance, duration)
    {
        return distance * duration / $(slider).width();
    }

    function animate(slide)
    {
        var slider = this;
        slider.animating = true;
        
        // Where are we now?
        var from = $(slider).find('.slide-pane.current');
        
        // Where are we moving to?
        var to = $(slider).find('.slide-pane').eq(slide.index);

        // Add a class on the slide we're moving to
        to.addClass('sliding-to');
        
        // Find the difference between the index of current pane and the index of where we're sliding to
        var difference;

        // If the index we're moving to is less than the current index and we're moving left
        if(to.index() < from.index() && slide.direction == 'left')
            difference = (to.index() + $(slider).find('.slide-pane').length) - from.index();

        // If the index we're moving to is greater than the current index and we're moving right
        else if(to.index() > from.index() && slide.direction == 'right')
            difference = (from.index() + $(slider).find('.slide-pane').length) - to.index();

        // Else...
        else
            difference = Math.abs(from.index() - to.index());

        var queue = {};
        var offset_to = (slide.direction == 'right') ? $(slider).width() : 0;

        if(slide.direction == 'right')
        {
            if(difference < slider.options.display)
            {
                for(var i = from.index() + slider.options.display, l = from.index(); i > l; i--)
                {
                    var index = i - 1;
                    
                    if(index >= $(slider).find('.slide-pane').length)
                        index -= $(slider).find('.slide-pane').length;

                    var pane = $(slider).find('.slide-pane').eq(index);

                    queue[index] = {from: pane.position().left, to: offset_to, status: 'inactive'};
                    offset_to += pane.outerWidth(true);
                }
            }
            else
            {
                // Start at current index
                for(var i = from.index(), l = from.index() + slider.options.display; i < l; i++)
                {
                    var index = i;
                    
                    if(index >= $(slider).find('.slide-pane').length)
                        index -= $(slider).find('.slide-pane').length;

                    var pane = $(slider).find('.slide-pane').eq(index);

                    queue[index] = {from: pane.position().left, to: offset_to, status: 'inactive'};
                    offset_to += pane.outerWidth(true);
                }
            }
        }
        else
        {
            if(difference < slider.options.display)
            {
                for(var i = from.index(), l = from.index() + slider.options.display; i < l; i++)
                {
                    var index = i;
                    
                    if(index >= $(slider).find('.slide-pane').length)
                        index -= $(slider).find('.slide-pane').length;

                    var pane = $(slider).find('.slide-pane').eq(index);

                    offset_to -= pane.outerWidth(true);
                    queue[index] = {from: pane.position().left, to: offset_to, status: 'inactive'};
                }
            }
            else
            {
                for(var i = from.index() + slider.options.display, l = from.index(); i > l; i--)
                {
                    var index = i - 1;
                    
                    if(index >= $(slider).find('.slide-pane').length)
                        index -= $(slider).find('.slide-pane').length;

                    var pane = $(slider).find('.slide-pane').eq(index);

                    offset_to -= pane.outerWidth(true);
                    queue[index] = {from: pane.position().left, to: offset_to, status: 'inactive'};
                }
            }
        }
        
        var offset_from = (slide.direction == 'right') ? 0 : $(slider).width();
        var offset_to = (slide.direction == 'right') ? $(slider).width() : 0;

        if(slide.direction == 'right')
        {
            for(var i = slide.index + slider.options.display, l = slide.index; i > l; i--)
            {
                var index = i - 1;
                
                if(index >= $(slider).find('.slide-pane').length)
                    index -= $(slider).find('.slide-pane').length;

                var pane = $(slider).find('.slide-pane').eq(index);

                if(!pane.hasClass('active'))
                {
                    pane.addClass('active');

                    offset_from -= pane.outerWidth(true);
                    offset_to -= pane.outerWidth(true);

                    queue[index] = {from: offset_from, to: offset_to, status: 'active'};
                }
                else
                {
                    offset_to -= pane.outerWidth(true);
                    queue[index] = {from: pane.position().left, to: offset_to, status: 'active'};
                }
            }
        }
        else
        {
            // Start at slide.index, until index + slider.options.display
            for(var i = slide.index, l = slide.index + slider.options.display; i < l; i++)
            {
                var index = i;
                
                if(index >= $(slider).find('.slide-pane').length)
                    index -= $(slider).find('.slide-pane').length;

                var pane = $(slider).find('.slide-pane').eq(index);

                if(!pane.hasClass('active'))
                {
                    pane.addClass('active');
                    queue[index] = {from: offset_from, to: offset_to, status: 'active'};

                    offset_from += pane.outerWidth(true);
                    offset_to += pane.outerWidth(true);
                }
                else
                {
                    queue[index] = {from: pane.position().left, to: offset_to, status: 'active'};
                    offset_to += pane.outerWidth(true);
                }
            }
        }

        // Trigger resize if this is a dynamic height slider
        if(slider.options.dynamicHeight)
        {
            $(window).trigger('resize', {animation: true});
        }
        
        for(var i = 0, keys = Object.keys(queue), l = keys.length; i < l; ++i)
        {
            var index = keys[i];
            var data = queue[keys[i]];
            var pane = $(slider).find('.slide-pane').eq(index);
            var duration = calculate_duration(slider, Math.abs(data.from - data.to), slider.options.duration);

            pane.addClass('animating');
            TweenLite.fromTo(pane[0], duration, {x: data.from}, {x: data.to, onComplete: animated, onCompleteParams: [slider, slide, data.status]});
        }
    }
    
    function animated(slider, slide, status)
    {
        var pane = $(this.target);
        
        $(slider).find('.slide-pane.current').removeClass('current');
        $(slider).find('.slide-pane').eq(slide.index).addClass('current').removeClass('sliding-to');

        if(status == 'active')
            pane.addClass('active');
        else
            pane.removeClass('active');

        pane.removeClass('animating');

        if($(slider).find('.animating').length == 0)
        {
            slider.animating = false;
            if(typeof slider.options.slideEnd == "function") slider.options.slideEnd.call(slider);
        }
    }

    /*************************
     * 
     *  Main slider code
     * 
     ************************/

    var Slider = function(input)
    {
        var slider = this;

        // Define default slider.options
        slider.options = {display: 1, duration: 0.5, dynamicHeight: false};
        slider.options = $.extend(slider.options, input);

        init(slider);
        
        // When resize is triggered
        $(window).on('resize', function(event, params)
        {
            // Clear any styles if this slider has become disabled
            if($(slider).hasClass('disabled'))
            {
                $(slider).removeAttr('style');
            }
            
            // If the slider isn't disabled
            if(!$(slider).hasClass('disabled'))
            {
                // Animate slider to use the height of the slide we're sliding to
                if(slider.options.dynamicHeight)
                {
                    var pane = $(slider).find('.sliding-to');

                    // Only adjust height if we're actually sliding somewhere
                    if(pane.length)
                    {
                        var parent = $(slider);
                        
                        pane.css('height', 'auto');
                        parent.height(pane.outerHeight(true));
                        pane.css('height', '100%');
                    }
                }
                // Else, if this is a static height slider
                else
                {
                    // Clear any styles on the slider
                    $(slider).removeAttr('style');
                    
                    // Loop through all panes and set the container height to the maximum pane height
                    $(slider).find('.slide-pane').each(function()
                    {
                        $(this).css('height', 'auto');
                        var parent = $(slider);

                        if($(this).outerHeight(true) > parent.height())
                        {
                            parent.height($(this).outerHeight(true));
                        }

                        $(this).css('height', '100%');
                    });
                }

                // Only trigger slide resize if this event wasn't triggered by animation
                if(params === undefined || !params.animation)
                {
                    $(slider).trigger('slide-resize');
                }
            }
        });

        // Trigger resize now to try to position everything
        $(window).trigger('resize');

        // Trigger resize again once the window is fully loaded
        $(window).load(function()
        {
            $(window).trigger('resize');
        });
        
        // Convenience event for going to the next pane
        $(slider).on('slide-next', function()
        {
            var current = $(slider).find('.slide-pane.current');
            var index = current.index();

            var next = index + 1;

            if(next >= $(slider).find('.slide-pane').length)
                next = 0;

            $(slider).trigger('slide-to', next);
        });

        // Convenience event for going to the previous pane
        $(slider).on('slide-prev', function()
        {
            var current = $(slider).find('.slide-pane.current');
            var index = current.index();

            var prev = index - 1;

            if(prev < 0)
                prev = $(slider).find('.slide-pane').length - 1;

            $(slider).trigger('slide-to', prev);
        });

        $(slider).on('slide-resize', function()
        {
            // Find the current pane
            var current = $(slider).find('.slide-pane.current').index();

            // Trigger slide to current, fixing any potential difference in positioning
            $(slider).trigger('slide-to', current);
        });

        // Allows sliding to any pane based on its index
        $(slider).on('slide-to', function(event, input)
        {
            var slide = {index: 0, direction: 'left'};

            // If our request is an object
            if(typeof input == "object") $.extend(slide, input);
            // Else if the request is simply a number
            if(input == parseInt(input))   slide.index = input;

            var from = $(slider).find('.slide-pane.current');
            var to = $(slider).find('.slide-pane').eq(slide.index);
            var last = $(slider).find('.slide-pane').length - 1;

            // If the pane we're moving to comes before the current, move right
            if(from.index() > to.index())
                slide.direction = 'right';

            // If the pane we're moving to comes after the current, move left
            if(from.index() < to.index())
                slide.direction = 'left';

            // If we're moving to the last pane from the first
            if(from.index() == 0 && to.index() == last)
                slide.direction = 'right';

            // If we're moving to the first pane from the last
            if(from.index() == last && to.index() == 0)
                slide.direction = 'left';

            if(!slider.animating && !$(slider).hasClass('disabled'))
            {
                animate.call(slider, slide);
                if(typeof slider.options != "undefined" && typeof slider.options.slideStart == "function") slider.options.slideStart.call(slider);
            }
        });
    };


    /*************************
     * 
     *  Bind to jQuery
     * 
     ************************/
    
    $.fn.hbSlider = function(options)
    {
        for(var i = 0, l = this.length; i < l; i++)
        {
            Slider.call(this[i], options);
        }
    };
})(jQuery);