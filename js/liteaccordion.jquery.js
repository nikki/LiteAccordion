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

    var defaults = {
        containerWidth : 960,   // fixed or 'auto'
        containerHeight : 320,  // fixed or 'auto'
        headerWidth: 48,

        activateOn : 'click',   // click or hover
        firstSlide : 1,
        slideSpeed : 800,
        onActivate : function() {},
        slideCallback : function() {},

        autoPlay : false,
        pauseOnHover : false,
        cycleSpeed : 6000,
        easing : 'swing',       // custom easing functions

        theme : 'basic',        // basic or dark
        rounded : false,
        enumerateSlides : false,
        linkable : false        // true = link slides via hash
    },
    
    // public methods    
    methods = {
        // start accordion animation
        play : function() {
            return setInterval(function() {

            });
        },

        // pause for specified duration
        pause : function(duration) {            
            methods.stop();

            return setTimeout(function() {
                methods.play();
            }, duration);
        },

        // stop accordion animation
        stop : function() {          
            return clearInterval(methods.play());
        },

        // move to next slide
        next : function() {
            return console.log(this);
        },

        // move to previous slide
        prev : function() {

        },

        init : function() {
            liteAccordion.apply(this, arguments);
        },

        destroy : function() {
            this.removeClass().addClass('accordion').find('li > h2').unbind('.liteAccordion');  // need to namespace events
            // clearInterval
        },
        
        debug : function() {
            // console.log(liteAccordion.call(this, 'debug'));

            return {
                defaults : defaults,
                methods : methods
            }
        }       
    },
    
    liteAccordion = function(options) {
        return this.each(function() {
            // merge defaults with options in new settings object			
            var settings = $.extend({}, defaults, options),   

            // 'globals'
                accordion = $(this),
                slides = accordion.find('li'),
                header = slides.children('h2'),
                slideLen = slides.length,
                slideWidth,

            // internal utility functions used by core
                utils = {
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
                        var width = utils.calcWidth(settings.containerWidth),
                            height = utils.calcHeight(settings.containerHeight);

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
                            header.bind('click.liteAccordion', utils.triggerClick);

                            if (settings.pauseOnHover) {}

                        } else if (settings.activateOn === 'hover') {
                            header.bind('mouseover.liteAccordion', utils.triggerHover);               
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
                            slides = utils.groupSlides($this),
                            group = slides.group,
                            pos = slides.pos,
                            wrap = group.parent();

                			// remove, then add selected class
                			header.removeClass('selected').filter($this).addClass('selected');

                            // animate wrapped set
                            wrap
                                .animate({ left : '+=' + pos.newPos }, 
                                    settings.slideSpeed, 
                                    settings.easing, 
                                    function() {                                    
                                        utils.ungroupSlides(group, pos.newPos);
                                        /*settings.slideBack.call( // callback ) */ 
                                    });                            
                        }
                    },
                    
                    // animation for hover event
                    triggerHover : function(e) {

                    },

            		init : function() {
            		    slideWidth = utils.calcWidth(settings.containerWidth) - (slideLen * settings.headerWidth);

                        utils.setStyles();                  
                        utils.setBehaviours();
            		}
                };

            utils.init();

        });        
    };

    $.fn.liteAccordion = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
    };
    
})(jQuery);