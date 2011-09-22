/*************************************************
*
*   project:    liteAccordion - horizontal accordion plugin for jQuery
*   author:     Nicola Hibbert
*   url:        http://nicolahibbert.com/horizontal-accordion-jquery-plugin
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
            firstSlide : 1,                 // displays slide n on page load
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
            accordion = elem,
            slides = accordion.children('ol').children('li'),
            header = slides.children('h2'),
            slideLen = slides.length,
            slideWidth = settings.containerWidth - slideLen * settings.headerWidth, 

        // public methods    
            methods = {
            
                // current slide index
                current : settings.firstSlide - 1,
        
                // start accordion animation
                play : function() {
                    var next = core.nextSlide();

                    core.playing = setInterval(function() {
                        header.eq(next()).trigger('click.liteAccordion');
                    }, settings.cycleSpeed);
                },
            
                // stop accordion animation
                stop : function() {
                    return clearInterval(core.playing);
                },

                // trigger next slide
                next : function() {

					// stop autoplay
					methods.stop();
					
					// trigger
					header.eq(methods.current + 1).trigger('click.liteAccordion');
                },

                // trigger previous slide
                prev : function() {

					// stop autoplay
					methods.stop();
					
					// trigger
					header.eq(methods.current - 1).trigger('click.liteAccordion');	
                },

                // destroy plugin instance
                destroy : function() {
                    
                    // stop autoplay
                    methods.stop();

                    // destroy behaviours, data, unbind events & remove styles
                    accordion
                        .removeClass()
                        .removeData('liteAccordion')
                        .find('li > h2')
                        .unbind('.liteAccordion')
                        .attr('style', '');
                    
                    // remove programmatically generated styles
                    slides.children().attr('style', '');
                },

                // poke around the internals
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
                
                // next slide index
                nextSlide : function() {
                    var slide = settings.firstSlide;
                    
                    // nomnomnom tasty closure
                    return function() {
                        return slide++ % slideLen;
                    }
                },  
    
                // holds interval counter
                playing : 0,    
        
                // set style properties
                setStyles : function() {
                    
                    // set container heights, widths, theme & corner style      
                    accordion
                        .width(settings.containerWidth)
                        .height(settings.containerHeight)
                        .addClass('accordion')
                        .addClass(settings.theme)
                        .addClass(settings.rounded && 'rounded');

                    // add slide class to list items for css
                    slides.addClass('slide');

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

                    // ie9 css fix
                    if ($.browser.msie && $.browser.version.substr(0,1) > 8) accordion.addClass('ie9');                 

                },

                // set behaviours
                setBehaviours : function() {                    
                    
                    // trigger click
                    if (settings.activateOn === 'click') {
                        header.bind('click.liteAccordion', core.triggerClick);

                        if (settings.pauseOnHover) {
    
                        }
                    
                    // trigger hover
                    } else if (settings.activateOn === 'hover') {
                        header.bind('mouseover.liteAccordion', core.triggerHover);               
                    }

                    // init autoplay
                    settings.autoPlay && methods.play();

                },
                
                // TODO
                getSlidePositions : function(slide) {
                    var index = header.index(slide),
                        pos = {
                            offset : slide.position().left,
                            left : index * settings.headerWidth,
                            right : index * settings.headerWidth + slideWidth,
                            newPos : 0
                        };

                    if (pos.offset === pos.left) {
                        pos.newPos = slideWidth;                                   
                    } else if (pos.offset === pos.right) {
                        pos.newPos = -slideWidth;
                    }

                    return pos;                      
                },                    
                
                // groups slides together for animation
                groupSlides : function(slide) {
                    var index = header.index(slide),
                        group,
                        pos = {
                            offset : slide.position().left,
                            left : index * settings.headerWidth,
                            right : index * settings.headerWidth + slideWidth,
                            newPos : 0
                        };

                    if (pos.offset === pos.left) {
                        pos.newPos = slideWidth;                            
                        group = header.slice(index + 1, slideLen).filter(function() { return this.offsetLeft === header.index(this) * settings.headerWidth }).parent().wrapAll('<div class="wrap"></div>');         
                    } else if (pos.offset === pos.right) {
                        pos.newPos = -slideWidth;                            
                        group = header.slice(0, index + 1).filter(function() { return this.offsetLeft === slideWidth + (header.index(this) * settings.headerWidth) }).parent().wrapAll('<div class="wrap"></div>');
                    }

                    return {
                        pos : pos,
                        group : group
                    }
                },                    

                // ungroups slides after animation complete
                ungroupSlides : function(group, newPos) {
                    group.each(function(index) {
                        var $this = $(this).children('h2'),
                            left = parseInt($this.css('left'), 10) + newPos;
                            
                        $this.css('left', left).next().css('left', left);                                                                              
                    });

                    group.unwrap();
                },
                
                // animation for click event
                triggerClick : function(e) {
                    var $this = $(this), slides, group, pos, wrap, index;

                    // if anim has not started
                    if (!accordion.find('.wrap').length) {
                        slides = core.groupSlides($this),
                        group = slides.group,
                        pos = slides.pos,
                        wrap = group.parent(),
						index = header.index($this);

                        // set data for method.current
                        methods.current = index === slideLen - 1 ? -1 : index;

                        // remove, then add selected class
                        header.removeClass('selected').filter($this).addClass('selected');

                        // animate wrapped set
                        wrap
                            .animate({ left : '+=' + pos.newPos }, 
                                settings.slideSpeed, 
                                settings.easing, 
                                function() {                                    
                                    core.ungroupSlides(group, pos.newPos);
                                    /*settings.slideBack.call( // callback ) */ 
                                });                            
                    }
                },
                
                // animation for hover event
                triggerHover : function(e) {

                },

                init : function() {
                    core.setStyles();                  
                    core.setBehaviours();
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
			if (method === 'current') {
				return instance[method];
			} else {
            	return instance[method].apply(elem, Array.prototype.slice.call(arguments, 1));				
			}
        }
    };

})(jQuery);