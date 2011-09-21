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
	        containerWidth : 960,   		// fixed (px)
	        containerHeight : 320,  		// fixed (px)
	        headerWidth: 48,				// fixed (px)

	        activateOn : 'click',   		// click or mouseover
	        firstSlide : 1,					// displays slide n on page load
	        slideSpeed : 800,				// slide animation speed
	        onActivate : function() {},		// callback on slide activate
	        slideCallback : function() {},	// callback on slide anim complete

	        autoPlay : false,				// automatically cycle through slides
	        pauseOnHover : false,			// pause on hover
	        cycleSpeed : 6000,				// time between slide cycles
	        easing : 'swing',       		// custom easing function

	        theme : 'basic',        		// basic, dark, light, or stitch
	        rounded : false,				// square or rounded corners
	        enumerateSlides : false,		// put numbers on slides 
	        linkable : false       			// link slides via hash
	    },

		// merge defaults with options in new settings object	
			settings = $.extend({}, defaults, options),
		
	    // 'globals'
	        accordion = $(elem),
	        slides = accordion.find('li'),
	        header = slides.children('h2'),
	        slideLen = slides.length,
	        slideWidth,		

		// public methods    
		    methods = {
				// return index of current slide
				current : function() {
					//console.log(this);
					//return this.data('current');
				},

		        // start accordion animation
		        play : function(speed) {
					//var header = this.find('li h2');

					//return methods.current();

		            //return setInterval(function() {
						// header.eq(methods.current() + 1).click();				
		            //}, settings.cycleSpeed);
		        },

		        // pause for specified duration
		        pause : function(duration) {            
		            methods.stop();

		            return setTimeout(function() {
		                // methods.play();
		            }, duration);
		        },

		        // stop accordion animation
		        stop : function() {          
		            return clearInterval(methods.play());
		        },

		        // move to next slide
		        next : function() {
		        	//var slide = methods.current(),
					//	slideLen = this.find('li h2').length;

					return function() {
						return slide++ % slideLen;
					}
		        },

		        // move to previous slide
		        prev : function() {
		        	//var slide = index - 1 || settings.firstSlide,
					//	slideLen = this.find('li h2').length;

					return function() {
						return slide-- % slideLen;
					}
		        },

		        init : function() {
		            //liteAccordion.apply(this, arguments);
		        },

		        destroy : function() {
					// destroys behaviours but not styles
		            accordion.removeClass().addClass('accordion').removeData('liteAccordion').find('li > h2').unbind('.liteAccordion');  // need to namespace events
		            // clearInterval
		        },

		        debug : function() {
					return {
		                defaults : defaults,
						settings : settings,
		                methods : methods,
						core : core
		            }
		        }       
		    },

       	// core utility and animation methods
            core = {	
                // trigger next slide (?)
                activateSlide : function() {

                },

                // maintains index of next slide
                nextSlide : function() {

                },

                // calculate container height
                calcHeight : function(height) {
                    return height === 'auto' ? accordion.parent().height() : height;            
                },

                // calculate container width
                calcWidth : function(width) {
                    return width === 'auto' ? accordion.parent().width() : width;
                },

                // set style properties
                setStyles : function() {
                    var width = core.calcWidth(settings.containerWidth),
                        height = core.calcHeight(settings.containerHeight);

                    // set container heights, widths, theme & corner style      
                    accordion
                        .width(width)
                        .height(height)
                        .addClass('accordion')
                        .addClass(settings.theme)
                        .addClass(settings.rounded && 'rounded');

                    // set tab width, height and selected class
                    header
                        .width(settings.theme === 'stitch' ? height - parseInt(header.css('borderTopWidth'), 10) * 2 : height) // TODO: this is counterintuitive, rewrite css
                        .height(settings.theme === 'stitch' ? settings.headerWidth - parseInt(header.css('borderLeftWidth'), 10) * 2 : settings.headerWidth) 
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
                },

                // set optional behaviours
                setBehaviours : function() {
                    if (settings.activateOn === 'click') {
						// namespaced click event
                        header.bind('click.liteAccordion', core.triggerClick);

                        if (settings.pauseOnHover) {}

                    } else if (settings.activateOn === 'hover') {
                        // namespaced hover
						header.bind('mouseover.liteAccordion', core.triggerHover);               
                    }

                    if (settings.autoPlay) {}

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
                    var $this = $(this), slides, group, pos, wrap;

                    // if anim has not started
                    if (!accordion.find('.wrap').length) {
                        slides = core.groupSlides($this),
                        group = slides.group,
                        pos = slides.pos,
                        wrap = group.parent();

						// set data
						accordion.data('current', header.index($this));

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
        		    slideWidth = core.calcWidth(settings.containerWidth) - (slideLen * settings.headerWidth);

                    core.setStyles();                  
                    core.setBehaviours();
		
					accordion.data('current', settings.firstSlide - 1); // zero index
		
        		}
            };

		// expose methods
		this.methods = methods;

		// init plugin
		core.init();
       
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

				// else create a new instance
				liteAccordion = new LiteAccordion(elem, method);
				elem.data('liteAccordion', liteAccordion);				
			});
			
		// otherwise, call method on current instance
		} else if (typeof method === 'string' && instance.methods[method]) {
			return instance.methods[method].apply(elem, Array.prototype.slice.call(arguments, 1));
		}
    };

})(jQuery);