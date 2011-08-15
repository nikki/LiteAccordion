/*
module('Instantiation', {
    setup : function() {
        var $test = $('#test');
    },
    teardown : function() {
        $test.remove();
    }
});
*/

test('jQuery in page', function() {
    expect(1);
    ok(typeof jQuery === 'function');
});

test('liteAccordion plugin in page', function() {
    expect(1);
    ok(typeof $.fn.liteAccordion === 'function');
});

/*
test('Init with no options', function() {
    expect(1);
    $test.liteAccordion();
    ok(typeof )
});
*/

//module('Methods');
//test('')

/*
methods
	play
	pause
	stop
	next
	prev
	init
	// destroy?

utils
	activateSlide
	nextSlide
	calcHeight
	calcWidth
	groupSlides
	setStyles
	setBehaviours
	groupSlides
	ungroupSlides
	triggerClick
	triggerHover
*/