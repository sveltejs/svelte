export default {
	solo: true,
	show: true,

	test ( assert, component, target, window ) {
		const allow = target.querySelector( '.allow-propagation' );
		const stop = target.querySelector( '.stop-propagation' );

		allow.dispatchEvent( new window.MouseEvent( 'click', { bubbles: true }) );
		stop.dispatchEvent( new window.MouseEvent( 'click', { bubbles: true }) );

		assert.equal( component.get( 'foo' ), true );
		assert.equal( component.get( 'bar' ), false );
	}
};
