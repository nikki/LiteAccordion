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
            slides = elem.children('ol').children('li'),
            header = slides.children('h2'),
            slideLen = slides.length,
            slideWidth = settings.containerWidth - slideLen * settings.headerWidth, 

        // public methods    
            methods = {
                    
                // start elem animation
                play : function() {
                    var next = core.nextSlide();

					// if already playing...
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
                    // stop autoplay
                    methods.stop();
                    
                    // trigger
                    header.eq(core.currentSlide + 1).trigger('click.liteAccordion');
                },

                // trigger previous slide
                prev : function() {
                    // stop autoplay
                    methods.stop();
                    
                    // trigger
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
                    if ($.browser.msie && $.browser.version.substr(0,1) > 8) elem.addClass('ie9');                 

                },

                // bind click and mouseover events
                bindEvents : function() {                                        
                    // trigger click
                    if (settings.activateOn === 'click') {
                        header.bind('click.liteAccordion', core.triggerSlide);

                        if (settings.pauseOnHover) {
    
                        }
                    
                    // trigger hover
                    } else if (settings.activateOn === 'mouseover') {
                        header.bind({
							'mouseover.liteAccordion' : core.triggerSlide,
							'click.liteAccordion' : core.triggerSlide						
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

				// TODO remove group, doesn't perform as well as previous version oddly?
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
                triggerSlide : function(e) {
                    var $this = $(this), slides, group, pos, wrap, index;

                    // if anim has not started
                    if (!elem.find('.wrap').length) {
                        slides = core.groupSlides($this),
                        group = slides.group,
                        pos = slides.pos,
                        wrap = group.parent(),
                        index = header.index($this);

						// if triggered by user, stop autoplay
						e.originalEvent && methods.stop();

                        // set core.currentSlide
                        core.currentSlide = index;

						// set location.hash
						if (settings.linkable) location.hash = $this.parent().attr('name');
						
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