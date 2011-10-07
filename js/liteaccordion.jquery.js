/*************************************************
*
*   project:    liteAccordion - horizontal elem plugin for jQuery
*   author:     Nicola Hibbert
*   url:        http://nicolahibbert.com/horizontal-elem-jquery-plugin
*   demo:       http://www.nicolahibbert.com/demo/liteAccordion
*
*   Version:    2.0a
*   Copyright:  (c) 2010-2011 Nicola Hibbert
*
/*************************************************/

;(function($) {
    
    var LiteAccordion = function(elem, options) {
        
        var defaults = {
            containerWidth : 960,           // fixed (px)
            containerHeight : 320,          // fixed (px)
            headerWidth: 48,                // fixed (px)

            activateOn : 'click',           // click or mouseover
            firstSlide : 1,                 // displays slide (n) on page load
            slideSpeed : 800,               // slide animation speed
            onActivate : function() {},     // callback on slide activate
            slideCallback : function() {},  // callback on slide anim complete

            autoPlay : false,               // automatically cycle through slides
            pauseOnHover : false,           // pause on hover
            cycleSpeed : 6000,              // time between slide cycles
            easing : 'swing',               // custom easing function

            theme : 'basic',                // basic, dark, light, or stitch
            rounded : false,                // square or rounded corners
            enumerateSlides : false,        // put numbers on slides 
            linkable : false                // link slides via hash
        },

        // merge defaults with options in new settings object   
            settings = $.extend({}, defaults, options),
        
        // 'globals'
            slides = elem.children('ol').children('li'),
            header = slides.children(':first-child'),
            slideLen = slides.length,
            slideWidth = settings.containerWidth - slideLen * settings.headerWidth, 

        // public methods    
            methods = {
                    
                // start elem animation
                play : function() {
                    var next = core.nextSlide();

                    if (core.playing) return;

                    // start autoplay
                    core.playing = setInterval(function() {
                        header.eq(next()).trigger('click.liteAccordion');
                    }, settings.cycleSpeed);
                },
            
                // stop elem animation
                stop : function() {
                    clearInterval(core.playing);
                    core.playing = 0;
                },

                // trigger next slide
                next : function() {
                    methods.stop();
                    header.eq(core.currentSlide + 1).trigger('click.liteAccordion');
                },

                // trigger previous slide
                prev : function() {
                    methods.stop();
                    header.eq(core.currentSlide - 1).trigger('click.liteAccordion');  
                },

                // destroy plugin instance
                destroy : function() {                    
                    // stop autoplay
                    methods.stop();

                    // remove hashchange event bound to window
                    $(window).unbind('.liteAccordion');

                    // remove generated styles, classes, data, events
                    elem
                        .attr('style', '')
                        .removeClass('accordion basic dark light stitch')
                        .removeData('liteAccordion')
                        .unbind('.liteAccordion')
                        .find('li > h2')
                        .unbind('.liteAccordion')
                        .filter('.selected')
                        .removeClass('selected');
                        
                    slides.removeClass('slide').children().attr('style', '');
                },

                // poke around the internals (NOT CHAINABLE)
                debug : function() {
                    return {
                        elem : elem,
                        defaults : defaults,
                        settings : settings,
                        methods : methods,
                        core : core
                    }
                }       
            },

        // core utility and animation methods
            core = {
        
                // set style properties
                setStyles : function() {                    
                    // set container heights, widths, theme & corner style
                    elem
                        .width(settings.containerWidth)
                        .height(settings.containerHeight)
                        .addClass('accordion')
                        .addClass(settings.rounded && 'rounded')                  
                        .addClass(settings.theme);
                        
                    // add slide class to list items for css
                    slides.addClass('slide');

                    // compensate for borders on 'light' theme
                    if (settings.theme === 'light') slideWidth -= parseInt(elem.children('ol').css('borderTopWidth'), 10);

                    // set tab width, height and selected class
                    header
                        .width(settings.containerHeight) // TODO: sort css out
                        .height(settings.headerWidth) 
                        .eq(settings.firstSlide - 1).addClass('selected');
                        
                    // set initial positions for each slide             
                    header.each(function(index) {
                        var $this = $(this),
                            left = index * settings.headerWidth;
                            
                        if (index >= settings.firstSlide) left += slideWidth;

                        $this
                            .css('left', left)
                            .next()
                                .width(slideWidth)
                                .css({ left : left, paddingLeft : settings.headerWidth });

                        // add number to bottom of tab
                        settings.enumerateSlides && $this.append('<b>' + (index + 1) + '</b>');

                    });

                    // ie css fixes
                    if ($.browser.msie) core.ieTransformTest();
                },

                // bind click and mouseover events
                bindEvents : function() {                                        
                    // trigger click
                    if (settings.activateOn === 'click') {
                        header.bind('click.liteAccordion', core.triggerSlide);                    
                    // trigger hover
                    } else if (settings.activateOn === 'mouseover') {
                        // how to get pause on hover to work with mouseover activation?
                        header.bind('mouseover.liteAccordion', core.triggerSlide);               
                    }
                    
                    // pause on hover (can't use custom events with $.hover())      
                    if (settings.pauseOnHover) {
                        elem.bind('mouseenter.liteAccordion', function() {
                            methods.stop();
                        }).bind('mouseleave.liteAccordion', function() {
                            methods.play();
                        });
                    } 
                },

                linkable : function() {
                    var triggerHash = function() {
                        var $this = $(this);

                        if ($this.attr('name') === location.hash.slice(1)) {
                            header.eq(slides.index($this)).trigger('click.liteAccordion');
                        }                       
                    };
                                    
                    // trigger on page load
                    // chrome exhibits some weirdness here if you manually type the hash in (chrome bug?), otherwise it's fine
                    location.hash && slides.each(triggerHash);

                    // trigger on hash change
                    $(window).bind('hashchange.liteAccordion', function() {
                        
                        // stop autoplay
                        methods.stop();

                        // iterate through slides, check if hash matches slide name -> trigger slide
                        slides.each(triggerHash);
                    });

                },
                
                // current slide index
                // zero index firstSlide setting on init
                currentSlide : settings.firstSlide - 1,             

                // next slide index
                nextSlide : function() {
                    var next = core.currentSlide + 1;

                    // nomnomnom tasty closure
                    return function() {
                        return next++ % slideLen;
                    }
                },  
    
                // holds interval counter
                playing : 0,
                
                // groups slides together for animation
                groupSlides : function(index) {                    
                    var slide = {
                        left : index * settings.headerWidth,
                        right : index * settings.headerWidth + slideWidth,
                        newPos : 0                     
                    };                 
                    
                    // set animation direction & group slides
                    if (this.offsetLeft === slide.left) {
                        slide.newPos = slideWidth;
                        // slide.siblings = header.slice(index + 1, slideLen);
                        slide.group = header.slice(index + 1, slideLen).filter(function() { return this.offsetLeft === header.index(this) * settings.headerWidth }); // group to animate
                    } else if (this.offsetLeft === slide.right) {
                        slide.newPos = -slideWidth;
                        // slide.siblings = header.slice(0, index + 1);
                        slide.group = header.slice(0, index + 1).filter(function() { return this.offsetLeft === slideWidth + (header.index(this) * settings.headerWidth) }); // group to animate
                    }
                    
                    return {
                        newPos : slide.newPos,
                        siblings : slide.siblings,
                        group : slide.group
                    }
                },                    
                
                // animation for click event
                triggerSlide : function(e) {
                    var $this = $(this), 
                        index = header.index($this),
                        next = $this.next(),
                        slide = core.groupSlides.call(this, index);

                    // check if animation in progress
                    if (!$this.is(':animated')) {
                        
                        // TODO!!!
                        // console.log(slide.group);

                        // if triggered by user, stop autoplay & trigger callback in context of sibling div
                        e.originalEvent && methods.stop(); 
                        
                        console.log(next);
                        settings.onActivate.call(next); // CHECK

                        // set core.currentSlide
                        core.currentSlide = index;

                        // set location.hash
                        if (settings.linkable) location.hash = $this.parent().attr('name');
                        
                        // remove, then add selected class
                        header.removeClass('selected').filter($this).addClass('selected');

                        // animate group
                        slide.group
                            .animate({ left : '+=' + slide.newPos }, 
                                settings.slideSpeed, 
                                settings.easing,
                                function() { /*console.log(next); settings.slideCallback.call($this)*/ }) // callback in ctx of sibling div   
                            .next()
                            .animate({ left : '+=' + slide.newPos }, 
                                settings.slideSpeed, 
                                settings.easing);                           
                    }
                },
                
                ieTransformTest : function() {
                    var div = document.createElement('div');
                    
                    if (typeof div.style.msTransform === 'string') {
                        elem.addClass('ie9');
                    } else if (typeof div.style.msFilter === 'string') {
                        elem.addClass('ie8');
                    }
                    
                    div = null;
                },
                
                init : function() {
                    core.setStyles();
                    core.bindEvents();

                    // init hash links
                    settings.linkable && core.linkable();

                    // init autoplay
                    settings.autoPlay && methods.play();
                }
            };

        // init plugin
        core.init();

        // expose methods
        return methods;
       
    };

    $.fn.liteAccordion = function(method) {
        var elem = this,
            instance = elem.data('liteAccordion');

        // if creating a new instance
        if (typeof method === 'object' || !method) {
            return elem.each(function() {
                var liteAccordion;
    
                // if plugin already instantiated, return
                if (instance) return;

                // otherwise create a new instance
                liteAccordion = new LiteAccordion(elem, method);
                elem.data('liteAccordion', liteAccordion);
            });

        // otherwise, call method on current instance
        } else if (typeof method === 'string' && instance[method]) {
            // debug method isn't chainable b/c we need the debug object to be returned
            if (method === 'debug') {
                return instance[method].apply(elem, Array.prototype.slice.call(arguments, 1));
            } else { // the rest of the methods are chainable though
                instance[method].apply(elem, Array.prototype.slice.call(arguments, 1));
                return elem;                
            }
        }
    };

})(jQuery);