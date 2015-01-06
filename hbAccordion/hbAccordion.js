
/*
 * hbAccordion -- HighBridge Accordions!
 *
 * A really simple accordion!
 */

(function($){

    /*************************
     * 
     *  Helper functions
     * 
     ************************/

    function init(accordion) {
        // setup accordion
        $(accordion).css({visibility:'hidden'});
        $(accordion).find(accordion.options.children).hide();
        $(accordion).css({visibility:'visible'});

        // Get first child
        var first = $(accordion).find(accordion.options.children).eq(0);
        first.show().addClass('current');
    }

    function animate(accordion, index) {

        accordion.animating = true;
        
        var from = $(accordion).find(accordion.options.children+'.current');
        var to = $(accordion).find(accordion.options.children).eq(index);

        // Make sure we're actually going somewhere
        if(to.length && from.index(accordion.options.children) != to.index(accordion.options.children)) {

            if(typeof accordion.options.animating == "function") accordion.options.animating.call(accordion, index);

            $(to).slideDown();
            $(from).slideUp(function(){
                accordion.animating = false;
            });

            from.removeClass('current');
            to.addClass('current');

            // Let the callback know where we moved to
            if(typeof accordion.options.animated == "function") accordion.options.animated.call(accordion, index);

        } else {

            // close current
            $(to).slideToggle(function(){
                accordion.animating = false;
            });
             
            // Let the callback know we closed the current
            if(typeof accordion.options.animated == "function") accordion.options.animated.call(accordion, to.index(accordion.options.children));
        }
    }

    /*************************
     * 
     *  Main accordion
     * 
     ************************/

    var Accordion = function(opts)
    {
        var accordion = this;

        // Define default accordion.options
        accordion.options = {};
        accordion.options = $.extend(accordion.options, opts);

        init(accordion);

        // Allows showing to any image based on its index
        $(accordion).on('accordion-change', function(event, index) {
            // Make sure we're not animating
            if(!accordion.animating) {
                animate(accordion, index);
            }
        });
    };


    /*************************
     * 
     *  Bind to jQuery
     * 
     ************************/
    $.fn.hbAccordion = function(options)
    {
        for(var i = 0, l = this.length; i < l; i++)
        {
            Accordion.call(this[i], options);
        }
    };

})(jQuery);
