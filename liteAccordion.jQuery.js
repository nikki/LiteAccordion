/*************************************************
*
*	project:  liteAccordion - horizontal accordion plugin for jQuery
*	author:   Nicola Hibbert
*	url:	  http://nicolahibbert.com/horizontal-accordion-jquery-plugin
*	demo:	  http://www.nicolahibbert.com/demo/liteAccordion
*
*	Copyright (c) 2010-2011 Nicola Hibbert
*	License: MIT
*
/*************************************************/
;(function($) {
	
	$.fn.liteAccordion = function(options) {
		
		// defaults
		var defaults = {
			containerWidth : 960,
			containerHeight : 320,
			headerWidth : 48,
			
			firstSlide : 1, 
			activateOn : 'click', // mouseover
			onActivate : function() {},
			slideSpeed : 800,
			slideCallback : function() {},			
			
			autoPlay : false, 
			cycleSpeed : 5000,
			pauseOnHover : false,

			theme : 'basic', // basic, light, dark
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
			.addClass((settings.theme === 'dark') ? 'dark' : (settings.theme === 'light') ? 'light' : 'basic')
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
						.width(slideWidth + settings.headerWidth)
						.css('left', left);
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

			settings.onActivate.call($accordion);

			if (this.offsetLeft === pos.left) {
				newPos = slideWidth;
			} else if (this.offsetLeft === pos.right) {
				newPos = -slideWidth;
			}

			$group
				.add($group.next())
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
				}
			},
			next : function() {
				// or prev
				this.parent().next().children(':first-child').trigger('click');
			},
			play : function() {
				if (!settings.autoPlay) return;
				
				// get all slide headers
				// get first active slide
				// trigger next after x amount of time
				
			}
		}	
		
	}; // end plugin

	// setTimeout(function() { $('h2:eq(3)').trigger('click') }, 1000);
	
})(jQuery);