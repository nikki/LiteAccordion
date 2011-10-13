/*************************************************!
*
*   project:    liteAccordion v2 - horizontal accordion plugin for jQuery
*   author:     Nicola Hibbert
*   url:        http://nicolahibbert.com/liteAccordion-v2/
*   demo:       http://www.nicolahibbert.com/demo/liteAccordion
*
*   Version:    2.0a
*   Copyright:  (c) 2010-2011 Nicola Hibbert
*
**************************************************/

;(function($) {
    
    var LiteAccordion = function(elem, options) {
        
        var defaults = {
            containerWidth : 960,                   // fixed (px)
            containerHeight : 320,                  // fixed (px)
            headerWidth: 48,                        // fixed (px)
                                                    
            activateOn : 'click',                   // click or mouseover
            firstSlide : 1,                         // displays slide (n) on page load
            slideSpeed : 800,                       // slide animation speed
            onTriggerSlide : function() {},         // callback on slide activate
            onSlideAnimComplete : function() {},    // callback on slide anim complete

            autoPlay : false,                       // automatically cycle through slides
            pauseOnHover : false,                   // pause on hover
            cycleSpeed : 6000,                      // time between slide cycles
            easing : 'swing',                       // custom easing function
                                                    
            theme : 'basic',                        // basic, dark, light, or stitch
            rounded : false,                        // square or rounded corners
            enumerateSlides : false,                // put numbers on slides 
            linkable : false                        // link slides via hash
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
                play : function(index) {
                    var next = core.nextSlide(index && index);

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
                    };
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
                        .width(settings.containerHeight)
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
                    if (settings.activateOn === 'click') {
                        header.bind('click.liteAccordion', core.triggerSlide);
                    } else if (settings.activateOn === 'mouseover') {
                        header.bind({
                            'mouseover.liteAccordion' : core.triggerSlide,
                            'click.liteAccordion' : core.triggerSlide                          
                        });
                    }
                    
                    // pause on hover (can't use custom events with $.hover())      
                    if (settings.pauseOnHover) {
                        elem.bind('mouseover.liteAccordion', function() {
                            methods.stop();
                        }).bind('mouseout.liteAccordion', function() {
                            methods.play();
                        });
                    } 
                },
                
                cacheSlideNames : function() {
                    var slideNames = [];

                    slides.each(function() {
                        slideNames.push($(this).attr('name'));
                    });
                    
                    core.cacheSlideNames = slideNames;
                },

                linkable : function() {
                    var triggerHash = function(e) {
                        if (e.type === 'load' && !window.location.hash) return;

                        if (window.location.hash.slice(1)) {
                            // header.eq(slides.index($this)).trigger('click.liteAccordion');
                        }
                    };

                    $(window).bind({
                        'hashchange' : triggerHash,
                        'load.liteAccordion' : triggerHash
                    });
                },
                
                // counter for autoPlay (zero index firstSlide on init)
                currentSlide : settings.firstSlide - 1,             

                // next slide index
                nextSlide : function(index) {
                    var next = index + 1 || core.currentSlide + 1;

                    // closure
                    return function() {
                        return next++ % slideLen;
                    };
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
                        slide.group = header.slice(index + 1, slideLen).filter(function() { return this.offsetLeft === header.index(this) * settings.headerWidth; }); // group to animate
                    } else if (this.offsetLeft === slide.right) {
                        slide.newPos = -slideWidth;
                        slide.group = header.slice(0, index + 1).filter(function() { return this.offsetLeft === slideWidth + (header.index(this) * settings.headerWidth); }); // group to animate
                    }
                    
                    return {
                        newPos : slide.newPos,
                        group : slide.group
                    };
                },                    
                
                // animation for click event
                triggerSlide : function(e) {
                    var $this = $(this), 
                        index = header.index($this),
                        slide = core.groupSlides.call(this, index);

                    // check if animation in progress
                    if (!header.is(':animated')) {
              
                        // trigger callback in context of sibling div
                        // settings.onTriggerSlide.call($this); // CHECK
                    
                        // reset current slide index in core.nextSlide closure
                        /*
                        if (e.originalEvent && settings.autoPlay) {
                            methods.stop();
                            methods.play(index);
                        }*/
                        
                        // set location.hash
                        if (settings.linkable) location.hash = $this.parent().attr('name');
                        
                        // remove, then add selected class
                        header.removeClass('selected').filter($this).addClass('selected');

                        // animate group
                        slide
                            .group
                            .animate({ left : '+=' + slide.newPos }, 
                                settings.slideSpeed, 
                                settings.easing,
                                function(e) { 
                                    // animate is called for each element, we only want the callback fn to trigger once TODO
                                    console.log(e);
                                    // settings.onSlideAnimComplete.call($this.next());
                                })
                            .next()
                            .animate({ left : '+=' + slide.newPos }, 
                                settings.slideSpeed, 
                                settings.easing);                           
                    }
                },
                
                ieTransformTest : function() {
                    var div = document.createElement('div');
                    
                    typeof div.style.msTransform === 'string' && elem.addClass('ie9');                
                    div = null;
                },
                
                init : function() {
                    core.setStyles();
                    core.bindEvents();

                    // check slide speed is not faster than cycle speed
                    if (settings.cycleSpeed < settings.slideSpeed) settings.cycleSpeed = settings.slideSpeed;

                    // init hash links
                    if (settings.linkable && 'onhashchange' in window) {
                        core.cacheSlideNames();
                        core.linkable();
                    }

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
                return instance[method].call(elem);
            } else { // the rest of the methods are chainable though
                instance[method].call(elem);
                return elem;                
            }
        }
    };

})(jQuery);