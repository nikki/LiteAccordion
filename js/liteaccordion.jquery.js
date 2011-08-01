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

        }, 

        destroy : function() {

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
                            .addClass(settings.theme)
                            .addClass(settings.rounded && 'rounded');

                        // set tab width, height and selected class
                        header
                            .width(height) // TODO: this is counterintuitive, rewrite css
                            .height(settings.headerWidth) 
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
                            header.click(utils.triggerClick);

                            if (settings.pauseOnHover) {}

                        } else if (settings.activateOn === 'hover') {
                            header.mouseover(utils.triggerHover);               
                        }

                        if (settings.autoPlay) {}

                    },

                    // groups slides together for animation (much better perf than v.1!)
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
                            group = header.slice(index + 1, slideLen).filter(function() { return this.offsetLeft === header.index(this) * settings.headerWidth }).parent().wrapAll('<div id="wrap"></div>');         
                        } else if (pos.offset === pos.right) {
                            pos.newPos = -slideWidth;                            
                            group = header.slice(0, index + 1).filter(function() { return this.offsetLeft === slideWidth + (header.index(this) * settings.headerWidth) }).parent().wrapAll('<div id="wrap"></div>');
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

                            $this.css('left', '+=' + newPos).next().css({ left : '+=' + newPos });                                                                              
                        });

                        group.unwrap();
                    },

                    // animation for click event
                    triggerClick : function(e) {
                        var $this = $(this),
                            slides = utils.groupSlides($this),
                            group = slides.group,
                            pos = slides.pos,
                            wrap = group.parent();

                        // return false if anim in progress
                        if (accordion.find('#wrap').is(':animated')) return false;

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
                    },

                    // animation for hover event
                    triggerHover : function(e) {
                        var $this = $(this),
                            slides = utils.groupSlides($this),
                            group = slides.group,
                            pos = slides.pos,
                            wrap = group.parent();

                        // return false if anim in progress
                        // if (accordion.find('#wrap').is(':animated')) return false;

                        // animate wrapped set
                        wrap
                            .animate({ left : pos.newPos }, 
                                settings.slideSpeed, 
                                settings.easing, 
                                function() { 
                                    utils.ungroupSlides(group, pos.newPos);
                                    /*settings.slideBack.call( // callback ) */ 
                                });
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
            return liteAccordion.apply(this, arguments);
        }
    };
    
})(jQuery);