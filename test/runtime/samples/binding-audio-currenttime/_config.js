export default {
	solo: true,

	test ( assert, component, target, window ) {
		assert.equal( component.get( 't' ), 0 );

		const audio = target.querySelector( 'audio' );
		const event = new window.Event( 'timeupdate' );

		audio.currentTime = 10;
		audio.dispatchEvent( event );

		assert.equal( component.get( 't' ), 10 );
		component.destroy();
	}
};
