/*************************************************
*
*	project:  	liteAccordion - horizontal accordion plugin for jQuery
*	author:   	Nicola Hibbert
*	url:	  	http://nicolahibbert.com/horizontal-accordion-jquery-plugin
*	demo:	  	http://www.nicolahibbert.com/demo/liteAccordion
*
*	Version:  	0.1.0
*	Copyright: 	(c) 2010-2011 Nicola Hibbert
*	License: 	MIT
*
/*************************************************/
;(function($) {
	
	$.fn.liteAccordion = function(options) {
		
		// defaults
		var defaults = {
			containerWidth : 960,
			containerHeight : 320,
			headerWidth : 48,
			
			firstSlide : 3, 
			activateOn : 'click', // mouseover
			onActivate : function() {},
			slideSpeed : 800,
			slideCallback : function() {},			
			
			autoPlay : true, 
			cycleSpeed : 5000,
			pauseOnHover : false,

			theme : 'basic', // basic, light, dark, stitch
			roundedCorners : false
		},
		
		// merge defaults with options in new settings object				
			settings = $.extend({}, defaults, options),
	
		// define key variables
			$accordion = this,
			$slides = $accordion.find('li'),
			slideLen = $slides.length,
			slideWidth = settings.containerWidth - (slideLen * settings.headerWidth),
			$header = $slides.children('h2');
		
		// set heights, widths, theme & corner style
		$accordion
			.height(settings.containerHeight)
			.width(settings.containerWidth)
			.addClass(settings.theme)
			.addClass(settings.roundedCorners && 'rounded');
		
		$header
			.width(settings.containerHeight)
			.height(settings.headerWidth);
		
		// set initial positions for each slide
		$header.each(function(index) {
			var $this = $(this),
				left = index * settings.headerWidth;
				
				if (index >= settings.firstSlide) {
					left += slideWidth;
				} 
				
				$this
					.css('left', left)
					.next()
						.width(slideWidth)
						.css({ left : left, paddingLeft : settings.headerWidth });
		});
		
		// bind event handler for activating slides
		$header.bind(settings.activateOn, function() {
			var $this = $(this),
				index = $header.index($this),
				pos = {
					left : index * settings.headerWidth,
					right : index * settings.headerWidth + slideWidth
				}, 
				newPos,
				$group = utils.getGroup.call(this, pos, index); 
			
			// stop animation
			utils.play.call($this, true, index);
			
			// callback	
			settings.onActivate.call($accordion);

			if (this.offsetLeft === pos.left) {
				newPos = slideWidth;
			} else if (this.offsetLeft === pos.right) {
				newPos = -slideWidth;
			} // rewrite

			// get group of tabs & animate
			$group
				.add($group.next())
				.stop()
				.animate({
					left : '+=' + newPos
				}, settings.slideSpeed, settings.slideCallback);	
		});
		
		// core utility and animation methods
		var utils = {
			getGroup : function(pos, index) {		
				var $parent = $(this).parent();
				
				if (this.offsetLeft === pos.left) {
					return $parent.nextAll().children(':first-child').filter(function() { return this.offsetLeft === $header.index(this) * settings.headerWidth });
				} else if (this.offsetLeft === pos.right) {
					return $parent.add($parent.prevAll()).children(':first-child').filter(function() { return this.offsetLeft === slideWidth + ($header.index(this) * settings.headerWidth) });	
				} // rewrite
			},
			nextSlide : function(clicked) {
				var currentSlide;
				
				(clicked) ? currentSlide = 0 : currentSlide = settings.activeSlide;
				
				return function() {
					// using eq to filter so needs to be zero indexed (i.e. don't add 1)
					return currentSlide++ % slideLen;
				}
			},
			play : function() {
				var getNext, go;
				if (!settings.autoPlay) return;
			
				getNext = utils.nextSlide(), // gogo gadget closure!
				go = function() {
					// (stop) ? $header.eq(index).click() : $header.eq(getNext()).click();				
				};
			
				
				
				setInterval(go, settings.cycleSpeed);
					
				$slides.hover(function() {
				// 	clearInterval(go);
				}, function() {
					// console.log('fail');
					// setInterval(go, settings.cycleSpeed);
				});
			},
			playNext : function() {
				// or prev
				// this.parent().next().children(':first-child').trigger('click');				
			}
		};
		
		// start autoplay
		settings.autoPlay && utils.play.call(this, false);
		
	};
	
})(jQuery);