module('Instantiation', {
    setup : function() {
        this.test = $('#test').liteAccordion();
    },
    teardown : function() {
        this.test.liteAccordion('destroy');
    }
});

test('jQuery in page', function() {
    ok(typeof jQuery === 'function');
});

test('liteAccordion.js in page', function() {
    ok(typeof $.fn.liteAccordion === 'function');
});

test('liteAccordion.css in page', function() {
	var stylesheet = $('link', document.head).each(function() {
		// return this.href.match('liteaccordion');
	});
});

test('DOM element returned on single instance', function() {
	ok(typeof this.test === 'object');
	ok(this.test[0].nodeType === 1); // instanceof HTMLElement doesn't work in IE7 (it doesn't support DOM L2)
	ok(this.test[0].id === 'test');
});

test('Unique DOM elements returned on multiple instances', function() {
	var test2 = $('#test2').liteAccordion();
	ok(typeof test2 === 'object');
	ok(test2[0].nodeType === 1); // instanceof HTMLElement doesn't work in IE7 (it doesn't support DOM L2)
	ok(test2[0].id === 'test2');
	
	test2.liteAccordion('destroy').remove(); // teardown
});

module('Methods', {
    setup : function() {
        this.test = $('#test').liteAccordion();
    },
    teardown : function() {
        this.test.liteAccordion('destroy');
    }
});

test('Current property on init', function() {
    console.log(this.test.liteAccordion('debug'));
	//console.log(this.test);
});


/*
methods
	current
	play
	stop
	next
	prev
	destroy
	debug
*/
module('Core', {
    setup : function() {
        this.test = $('#test').liteAccordion();
    },
    teardown : function() {
        this.test.liteAccordion('destroy');
    }
});


/*
core
	setStyles
	setBehaviours
	linkable	
	nextSlide
	playing
	getSlidePositions
	groupSlides
	ungroupSlides
	triggerClick
	triggerHover
	init
*/