/*************************************************!
*
*   project:    liteAccordion - a horizontal accordion plugin for jQuery
*   author:     Nicola Hibbert
*   url:        http://nicolahibbert.com/liteaccordion-v2/
*   demo:       http://www.nicolahibbert.com/demo/liteAccordion/
*
*   Version:    2.0.2
*   Copyright:  (c) 2010-2011 Nicola Hibbert
*   Licence:    MIT
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

                    header.eq(core.currentSlide === slideLen - 1 ? 0 : core.currentSlide + 1).trigger('click.liteAccordion');
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
                        .find('li > :first-child')
                        .unbind('.liteAccordion')
                        .filter('.selected')
                        .removeClass('selected')
                        .end()
                        .find('b')
                        .remove();
                        
                    slides
                        .removeClass('slide')
                        .children()
                        .attr('style', '');
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
                        
                    // set tab width, height and selected class
                    slides
                        .addClass('slide')
                        .children(':first-child')
                        .width(settings.containerHeight)
                        .height(settings.headerWidth)
                        .eq(settings.firstSlide - 1)
                        .addClass('selected');

                    // set initial positions for each slide             
                    header.each(function(index) {
                        var $this = $(this),
                            left = index * settings.headerWidth,
                            margin = header.first().next(),
                            offset = parseInt(margin.css('marginLeft'), 10) || parseInt(margin.css('marginRight'), 10) || 0;
                            
                        if (index >= settings.firstSlide) left += slideWidth;

                        $this
                            .css('left', left)
                            .next()
                                .width(slideWidth - offset)
                                .css({ left : left, paddingLeft : settings.headerWidth });

                        // add number to bottom of tab
                        settings.enumerateSlides && $this.append('<b>' + (index + 1) + '</b>');

                    });
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
                    if (settings.pauseOnHover && settings.autoPlay) {
                        elem.bind('mouseover.liteAccordion', function() {
                            core.playing && methods.stop();
                        }).bind('mouseout.liteAccordion', function() {
                            !core.playing && methods.play(core.currentSlide);
                        });
                    } 
                },
                
                linkable : function() {
                    var cacheSlideNames = (function() {
                        var slideNames = [];

                        slides.each(function() {
                            if ($(this).attr('name')) slideNames.push(($(this).attr('name')).toLowerCase());
                        });

                        // memoize
                        return cacheSlideNames = slideNames;                        
                    })();
                    
                    var triggerHash = function(e) {
                        var index;
                        
                        if (e.type === 'load' && !window.location.hash) return;
                        if (e.type === 'hashchange' && core.playing) return;
                        
                        index = $.inArray((window.location.hash.slice(1)).toLowerCase(), cacheSlideNames);
                        if (index > -1 && index < cacheSlideNames.length) header.eq(index).trigger('click.liteAccordion');
                    };

                    $(window).bind({
                        'hashchange.liteAccordion' : triggerHash,
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
                
                // animates left and right groups of slides
                // side: denotes left side
                animSlideGroup : function(index, next, side) {
                    var filterExpr = side ? ':lt(' + (index + 1) + ')' : ':gt(' + index + ')';

                    slides
                        .filter(filterExpr)
                        .each(function() {
                            var $this = $(this),
                                slideIndex = slides.index($this);
                                
                            $this
                                .children()
                                .stop(true)
                                .animate({
                                    left : (side ? 0 : slideWidth) + slideIndex * settings.headerWidth
                                }, 
                                    settings.slideSpeed, 
                                    settings.easing,
                                    function() { 
                                        // flag ensures that fn is only called one time per triggerSlide
                                        if (!core.slideAnimCompleteFlag) {
                                            settings.onSlideAnimComplete.call(next);
                                            core.slideAnimCompleteFlag = true;
                                        }
                                    });                                     
                        });
                },
                
                slideAnimCompleteFlag : false,
                
                // trigger slide animation
                triggerSlide : function(e) {
                    var $this = $(this),
                        index = header.index($this),
                        next = $this.next();
                                                                                       
                    // update core.currentSlide
                    core.currentSlide = index;
                    
                    // reset onSlideAnimComplete callback flag
                    core.slideAnimCompleteFlag = false;

                    // remove, then add selected class
                    header.removeClass('selected').filter($this).addClass('selected');               
                 
                    // reset current slide index in core.nextSlide closure
                    if (e.originalEvent && settings.autoPlay) {
                        methods.stop();
                        methods.play(index);
                    }
                    
                    // set location.hash
                    if (settings.linkable && !core.playing) window.location.hash = $this.parent().attr('name');

                    // trigger callback in context of sibling div
                    settings.onTriggerSlide.call(next);

                    // animate left & right groups
                    core.animSlideGroup(index, next, true);
                    core.animSlideGroup(index, next);
                },
                
                ieClass : function() {
                    var version = +($.browser.version).charAt(0);

                    if (version < 7) methods.destroy();
                    if (version === 7 || version === 8) {
                        slides.each(function(index) {
                            $(this).addClass('slide-' + index);
                        });
                    }

                    elem.addClass('ie ie' + version);
                },
                
                init : function() {
                    // test for ie
                    if ($.browser.msie) core.ieClass();              

                    // init styles and events
                    core.setStyles();
                    core.bindEvents();

                    // check slide speed is not faster than cycle speed
                    if (settings.cycleSpeed < settings.slideSpeed) settings.cycleSpeed = settings.slideSpeed;

                    // init hash links
                    if (settings.linkable && 'onhashchange' in window) core.linkable();

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