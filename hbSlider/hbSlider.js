/*
 * hbSlider -- HighBridge Slider
 *
 */

jQuery.fn.reverse = [].reverse;

(function($)
{
    /*************************
     * 
     *  Helper functions
     * 
     ************************/

    Array.prototype.clean = function(deleteValue)
    {
        for (var i = 0; i < this.length; i++)
        {
            if (this[i] == deleteValue)
            {
                this.splice(i, 1);
                i--;
            }
        }
        
        return this;
    };

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

    function set_positions(slider, direction)
    {
 //       console.log(slider.panes);
        
        var bounds = calculate_bounds(slider);
        var moved = [];

        // Loop through all panes
        for(var i = 0, l = slider.panes.length; i < l; i++)
        {
            var index = slider.panes[i];            
            var pane = $(slider).find('.slide-pane').eq(index);

            // Before sliding left, find all panes less than the viewing area and position them to the end of the slider
            if(direction == 'left')
            {
                if(pane.position().left < 0)
                {
                    TweenLite.set(pane[0], {x: bounds.right});
                    bounds.right += pane.outerWidth(true);

                    slider.panes[i] = undefined;
                    moved.push(index);
                }
            }
        }

        // Or if we're sliding right, find all panes greater than the viewing area and position them at the beginning of the slider
        if(direction == 'right')
        {
            // Loop through panes backwards
            for(var i = slider.panes.length; i > 0; i--)
            {
                var index = slider.panes[i - 1];
                var pane = $(slider).find('.slide-pane').eq(index);

                if(pane.position().left >= $(slider).width())
                {
                    TweenLite.set(pane[0], {x: bounds.left - pane.outerWidth(true)});
                    bounds.left -= pane.outerWidth(true);

                    slider.panes[i - 1] = undefined;
                    moved.unshift(index);
                }
            }
        }


        slider.panes.clean();

console.log("Panes: ", slider.panes);
console.log("Moved: ", moved);

        if(direction == 'left')
            slider.panes = slider.panes.concat(moved);
        else
            slider.panes = moved.concat(slider.panes);

console.log(slider.panes);

     //   return slider;
    }

    function set_offscreen(slider, slide)
    {
        // Loop through all panes that need to be animated
        var offset = (slide.direction == 'left') ? $(slider).width() : 0;

        // Start at slide.index, until index + slider.options.display
        for(var i = slide.index, l = slide.index + slider.options.display; i < l; i++)
        {
            var index = i;
            
            if(index >= $(slider).find('.slide-pane').length)
                index -= $(slider).find('.slide-pane').length;

            var pane = $(slider).find('.slide-pane').eq(index);
            
            if(slide.direction == 'left')
            {
                TweenLite.set(pane[0], {x: offset});
                offset += pane.outerWidth(true);
            }
            else
            {
                offset -= pane.outerWidth(true);
                TweenLite.set(pane[0], {x: offset});
            }
        }
    }

    function calculate_bounds(slider)
    {
        var bounds = {left: 0, right: 0};
        
        $(slider).find('.slide-pane').each(function()
        {
            var position = $(this).position();
            var left = position.left;
            var right = position.left + $(this).outerWidth(true);

            if(left < bounds.left)
                bounds.left = left;

            if(right > bounds.right)
                bounds.right = right;
        });

        return bounds;
    }

    function calculate_duration(slider, distance, duration)
    {
        return distance * duration / $(slider).width();
    }

    function animate(slide)
    {
        var slider = this;
        slider.animating = true;

        // Find element we're moving to
        var to;

//console.log(slide);

        if(slide.index >= $(this).find('.slide-pane').length)
            to = $(this).find('.slide-pane').first();
//        else if(slide.index <= 0)
//            to = $(this).find('.slide-pane').last();
        else
            to = $(this).find('.slide-pane').eq(slide.index);
        
        // Find current element
        var from = $(this).find('.slide-pane.current');
        
        // Find the difference between the index of current pane and the index of where we're sliding to
        var difference = Math.abs(slide.index - from.index());

        slide.index = to.index();


        var panes = [];

        // Populate the panes array based on the number of panes we have, times two
        for(var i = 0, l = $(this).find('.slide-pane').length; i < l * 2; i++)
        {
            // Why times two?
            // It lets us find the index of the panes we need to animate, regardless of direction, without having to do bounds checking
            
            if(l > i)
                panes.push(i);
            else
                panes.push(i - l);
        }


        var slide_panes = panes;

        if(slide.direction == 'right')
            slide_panes = slide_panes.reverse();

        var index_from = panes.indexOf(from.index());
        var remaining_panes = slide_panes.slice(index_from + 1);
        var index_to = index_from + 1 + remaining_panes.indexOf(to.index());


        var difference = Math.abs(index_to - index_from);
        

       // console.log(slide_panes, index_from, index_to, difference)

        // If the difference is < the number of panes being displayed
        if(difference < this.options.display)
        {
//            Say you start at 4 and you're going next, so you'd be going to 0
 //           So we need to go... from's index for distance

            var direction, start;

            if(slide.direction == 'right')
            {
                direction = -1;
                start = from.index() + $(this).find('.slide-pane').length;
            }
            else
            {
                direction = 1;
                start = from.index();
            }

            var distance = 0;

            for(var i = start, l = start + difference; i < l; i++)
            {
//              console.log(panes, panes[i + offset]); //i, offset, $(this).find('.slide-pane'));
        
                
                distance += $(this).find('.slide-pane').eq(panes[i]).outerWidth(true);
                $(this).find('.slide-pane').eq(panes[i]);
            }

            set_positions(slider, slide.direction);
            var duration = calculate_duration(slider, distance, slider.options.duration);

            $(this).find('.slide-pane').each(function()
            {
                TweenLite.to(this, duration, {x: '-=' + distance * direction, onComplete: animated, onCompleteParams: [slider, slide]});
            });
        }
    
        // Else, simply animate everything off screen
        else
        {
            var distance = $(slider).width();
            var direction = (slide.direction == 'right') ? -1 : 1;

            set_offscreen(slider, slide);
            
            // Find current element
            var from = $(slider).find('.slide-pane.current');

            // Start at current index
            for(var i = from.index(), l = from.index() + slider.options.display; i < l; i++)
            {
                var index = i;
                
                if(index >= $(slider).find('.slide-pane').length)
                    index -= $(slider).find('.slide-pane').length;

                var pane = $(slider).find('.slide-pane').eq(index);

                TweenLite.to(pane[0], slider.options.duration, {x: '-=' + distance * direction, onComplete: animated, onCompleteParams: [slider, slide]});
            }
            

            // Start at slide.index, until index + slider.options.display
            for(var i = slide.index, l = slide.index + slider.options.display; i < l; i++)
            {
                var index = i;
                
                if(index >= $(slider).find('.slide-pane').length)
                    index -= $(slider).find('.slide-pane').length;

                var pane = $(slider).find('.slide-pane').eq(index);

                TweenLite.to(pane[0], slider.options.duration, {x: '-=' + distance * direction, onComplete: animated, onCompleteParams: [slider, slide]});
            }

//            slider.animating = false;
console.log('what');
        }        
    }

    // Initialize slider
    // Show first pane
    // Show any subsequent panes based on display option

    function new_animate(slide)
    {
        var slider = this;
        
        // Where are we now?
        var from = $(slider).find('.slide-pane.current');
        
        // Where are we moving to?
        var to = $(slider).find('.slide-pane').eq(slide.index);
        
        // How far do we have to move to get to where we're going?
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

        // Loop through all elements 

        var panes = [];

        // Populate the panes array based on the number of panes we have, times two
        for(var i = 0, l = $(this).find('.slide-pane').length; i < l * 2; i++)
        {
            // Why times two?
            // It lets us find the index of the panes we need to animate, regardless of direction, without having to do bounds checking
            
            if(l > i)
                panes.push(i);
            else
                panes.push(i - l);
        }

        var direction, start;
        var distance = 0;

        if(slide.direction == 'right')
        {
            direction = -1;
            start = from.index() + $(slider).find('.slide-pane').length;

            for(var i = start, l = start - difference; i > l; i--)
            {
                console.log("Index: ", i);
                distance += $(slider).find('.slide-pane').eq(panes[i - 1]).outerWidth(true);
                $(slider).find('.slide-pane').eq(panes[i - 1]);
            }
        }
        else
        {
            direction = 1;
            start = from.index();

            for(var i = start, l = start + difference; i < l; i++)
            {
                distance += $(slider).find('.slide-pane').eq(panes[i]).outerWidth(true);
                $(slider).find('.slide-pane').eq(panes[i]);
            }
        }


//    console.log("------------------------------");
//    console.log("Panes: ", panes);
//    console.log("Start: ", start);
//    console.log("Difference: ", difference);



        var queue = {};
        var offset_to = (slide.direction == 'right') ? $(slider).width() : 0;

// Get all current panes
// Find their current position
// Determine the offset they need to move to (off screen)

        // Start at current index
        for(var i = from.index(), l = from.index() + slider.options.display; i < l; i++)
        {
            var index = i;
            
            if(index >= $(slider).find('.slide-pane').length)
                index -= $(slider).find('.slide-pane').length;

            var pane = $(slider).find('.slide-pane').eq(index);

            if(slide.direction == 'right')
            {
                queue[index] = {from: pane.position().left, to: offset_to, status: 'inactive'};
                offset_to += pane.outerWidth(true);
            }
            else
            {
                offset_to -= pane.outerWidth(true);
                queue[index] = {from: pane.position().left, to: offset_to, status: 'inactive'};
            }
        }

// Get all new panes
// Do they need to have a position defined?
// Set their starting position if necessary
// Determine where they need to move to

        var offset_from = (slide.direction == 'right') ? 0 : $(slider).width();
        var offset_to = (slide.direction == 'right') ? $(slider).width() : 0;


//start at 4, 5, 6

//start at 6, 5, 4

if(slide.direction == 'right')
{
        // Start at slide.index, until index + slider.options.display
        for(var i = slide.index + slider.options.display, l = slide.index; i > l; i--)
        {
            var index = i - 1;
            
            if(index >= $(slider).find('.slide-pane').length)
                index -= $(slider).find('.slide-pane').length;

            console.log(index);


            var pane = $(slider).find('.slide-pane').eq(index);

            if(!pane.hasClass('active'))
            {
                pane.addClass('active');

                if(slide.direction == 'right')
                {
                    offset_from -= pane.outerWidth(true);
                    offset_to -= pane.outerWidth(true);

                    queue[index] = {from: offset_from, to: offset_to, status: 'active'};


                }
                else
                {
                    queue[index] = {from: offset_from, to: offset_to, status: 'active'};

                    offset_from += pane.outerWidth(true);
                    offset_to += pane.outerWidth(true);
                }
            }
            else
            {
                if(slide.direction == 'right')
                {
                    offset_to -= pane.outerWidth(true);
                    queue[index] = {from: pane.position().left, to: offset_to, status: 'active'};


                }
                else
                {
                    queue[index] = {from: pane.position().left, to: offset_to, status: 'active'};

                    offset_to += pane.outerWidth(true);
                }

            }

//            queue[index] = 'active';
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

                if(slide.direction == 'right')
                {
                    offset_from -= pane.outerWidth(true);

                    queue[index] = {from: offset_from, to: offset_to, status: 'active'};

                    offset_to += pane.outerWidth(true);

                }
                else
                {
                    queue[index] = {from: offset_from, to: offset_to, status: 'active'};

                    offset_from += pane.outerWidth(true);
                    offset_to += pane.outerWidth(true);
                }
            }
            else
            {
                if(slide.direction == 'right')
                {
                    queue[index] = {from: pane.position().left, to: offset_to, status: 'active'};

                    offset_to += pane.outerWidth(true);

                }
                else
                {
                    queue[index] = {from: pane.position().left, to: offset_to, status: 'active'};

                    offset_to += pane.outerWidth(true);
                }

            }

//            queue[index] = 'active';
        }


}
 //       var duration = calculate_duration(slider, distance, slider.options.duration);

        for(var i = 0, keys = Object.keys(queue), l = keys.length; i < l; ++i)
        {
            var index = keys[i];
            var data = queue[keys[i]];
            var pane = $(slider).find('.slide-pane').eq(index);
            var duration = calculate_duration(slider, Math.abs(data.from - data.to), slider.options.duration);

            TweenLite.fromTo(pane[0], duration, {x: data.from}, {x: data.to, onComplete: animated, onCompleteParams: [slider, slide, data.status]});
        }

        // Create a queue for all animations
        // Loop through all currently displayed panes and queue them to animate off screen
        // Loop through all panes to be displayed and queue them to animate to their calculated position
        // Remove duplicates somehow
        // Perform animation queue
    }
    
    function animated(slider, slide, status)
    {
        
        var pane = $(this.target);

        slider.animating = false;
        
        $(slider).find('.slide-pane.current').removeClass('current');
        $(slider).find('.slide-pane').eq(slide.index).addClass('current');

        if(status == 'active')
            pane.addClass('active');
        else
            pane.removeClass('active');

        if(typeof slider.options.slideEnd == "function") slider.options.slideEnd(slider);


//        if(pane.index('.slide-pane') == $(slider).find('.slide-pane').length - 1)
        if($(slider).find('.slide-pane').last()[0] == pane[0])
        {
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
        slider.options = {display: 1, duration: 0.5};
        slider.options = $.extend(slider.options, input);

        init(slider);
        
        // When resize is triggered
        $(window).on('resize', function()
        {
            // First clear any previous styles set on the slider
            $(slider).removeAttr('style');
            
            // Loop through all panes and set the container height to their size
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

            $(slider).trigger('slide-to', {index: prev, direction: 'right'});
        });

        // Allows sliding to any pane based on its index
        $(slider).on('slide-to', function(event, input)
        {
            var slide = {index: 0, direction: 'left'};

            // If our request is an object
            if(typeof input == "object") $.extend(slide, input);
            // Else if the request is simply a number
            if(input == parseInt(input))   slide.index = input;

            if(!slider.animating)
            {
                new_animate.call(slider, slide);
                if(typeof slider.options != "undefined" && typeof slider.options.slideStart == "function") slider.options.slideStart(slider);
            }

/*
            
            // Find index
            var to = $(this).find('.slide-pane').eq(slide.index);

            // Find current element
            var from = $(this).find('.slide-pane.current');

            // Make sure we're actually going somewhere
            // Also make sure we're not already animating
            if(to.index() != from.index() && !to[0].dataset.to && !from[0].dataset.from)
            {
                animate.call(this, slide);
                if(typeof slider.options != "undefined" && typeof slider.options.slideStart == "function") slider.options.slideStart(this);
            }
            */
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
