
/*
 * hbGallery -- HighBridge Gallery
 *
 * A really simple gallery!
 */

(function($)
{
    /*************************
     * 
     *  Helper functions
     * 
     ************************/

    function init(gallery)
    {
        // Get first child
        var first = $(gallery).find(gallery.options.children).eq(0);
        first.addClass('current');

        // Populate the parent with our first child
        $('body').find(gallery.options.parent).attr('src', first[0].dataset.src);
    }

    function animate(gallery, index)
    {
        gallery.animating = true;
        
        var from = $(gallery).find(gallery.options.children+'.current');
        var to = $(gallery).find(gallery.options.children).eq(index);

        // Make sure we're actually going somewhere
        if(from.index(gallery.options.children) != to.index(gallery.options.children))
        {
            $('body').find(gallery.options.parent).fadeOut(function()
            {
                $(this).attr('src', to[0].dataset.src);

                $(this).on('load', function()
                {
                    $(this).fadeIn();

                    from.removeClass('current');
                    to.addClass('current');

                    gallery.animating = false;

                    // Let the callback know where we moved to
                    if(typeof gallery.options.callback == "function") gallery.options.callback.call(gallery, index);
                });
            });
        }
        else
        {
            gallery.animating = false;
            $('body').find(gallery.options.parent).fadeIn();
             
            // Let the callback know we didn't do anything
            if(typeof gallery.options.callback == "function") gallery.options.callback.call(gallery, from.index(gallery.options.children));
        }
    }

    /*************************
     * 
     *  Main gallery code
     * 
     ************************/

    var Gallery = function(input)
    {
        var gallery = this;

        // Define default gallery.options
        gallery.options = {display: 1, duration: 0.5};
        gallery.options = $.extend(gallery.options, input);

        init(gallery);
        
        // Convenience event for going to the next pane
        $(gallery).on('gallery-next', function()
        {
            var current = $(gallery).find(gallery.options.children+'.current');
            var index = current.index(gallery.options.children);

            var next = index + 1;

            if(next >= $(gallery).find(gallery.options.children).length)
                next = 0;

            $(gallery).trigger('gallery-show', next);
        });

        // Convenience event for going to the previous pane
        $(gallery).on('gallery-prev', function()
        {
            var current = $(gallery).find(gallery.options.children+'.current');
            var index = current.index(gallery.options.children);

            var prev = index - 1;

            if(prev < 0)
                prev = $(gallery).find(gallery.options.children).length - 1;

            $(gallery).trigger('gallery-show', prev);
        });

        // Allows showing to any image based on its index
        $(gallery).on('gallery-show', function(event, index)
        {
            // Make sure we're not animating
            if(!gallery.animating)
            {
                animate(gallery, index);
            }
        });

        // Hide the gallery parent
        $(gallery).on('gallery-hide', function()
        {
            $('body').find(gallery.options.parent).hide();
        });
    };


    /*************************
     * 
     *  Bind to jQuery
     * 
     ************************/
    
    $.fn.hbGallery = function(options)
    {
        for(var i = 0, l = this.length; i < l; i++)
        {
            Gallery.call(this[i], options);
        }
    };
})(jQuery);
