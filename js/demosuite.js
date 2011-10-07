;(function($) {
    
    var demo = $('#demo'),
        selects = $('.options select'),
        easing = $('#easing'),
        easingFn,
        outputToggle = $('.output h2 a'),
        resetBtn = $('#reset'),
        options,
        update = function() {
            var defaults = demo.liteAccordion('debug').defaults;
            
            // reset 'global' options obj
            options = {};

            selects.each(function() { 
                var current = this.value,
                    value;

                if (!isNaN(parseInt(current, 10))) {
                    value = parseInt(current, 10); 
                } else if (current === 'custom') {
                    value = parseInt($(this).next().val());
                } else if (current === 'true') {
                    value = true;
                } else if (current === 'false') {
                    value = false;
                } else {
                    value = current;
                }
                
                if (defaults[this.name] !== value) {
                    options[this.name] = value; 
                }
                        
            });                 

            demo.liteAccordion('destroy');
            demo.liteAccordion(options);
            
            $('.output textarea').text('$("#yourAccordion").liteAccordion(' + JSON.stringify(options) + ');');
            
        },
        reset = function() {
            options = {};
            
            selects.each(function() {
                $(this).children().eq(0).attr('selected', true);
            });

            $('.options').find('input[type=text]').remove();
            easing.find('option[value=swing]').attr('selected', true);
            
            demo.liteAccordion('destroy');
            demo.liteAccordion();
            
            $('.output textarea').text('$("#yourAccordion").liteAccordion();');
        };
        
    // create easing select options from plugin
    for (easingFn in $.easing) {
        if (easingFn !== 'def') {
            easing.append($('<option value="' + easingFn + '">' + easingFn +'</option>')); // should use a frag, cba tho.                    
        }
    }
                
    easing.find('option[value=swing]').attr('selected', true);
    
    // init accordion
    demo.liteAccordion({ onActivate : function() { alert('do something!') } });

    // get new options on change event
    selects.change(function() {     
        this.value === 'custom' ? $(this).after('<input type="text" />') : update();
    });
    
    // new opts on enter
    $(window).keyup(function(e) {
        if (e.keyCode === 13) update();
    });
    
    // reset
    resetBtn.click(function(e) {
        reset();
        e.preventDefault();
    });
    
    // show/hide code output                        
    outputToggle.click(function(e) {
        $(this).parent().next().slideToggle();
        e.preventDefault();
    });

})(jQuery);