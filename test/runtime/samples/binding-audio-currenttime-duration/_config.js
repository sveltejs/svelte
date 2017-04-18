export default {
	test ( assert, component, target, window ) {
		assert.equal( component.get( 't' ), 0 );
		assert.equal( component.get( 'd' ), 0 );
		assert.equal( component.get( 'paused' ), true );

		const audio = target.querySelector( 'audio' );
		const timeupdate = new window.Event( 'timeupdate' );
		const durationchange = new window.Event( 'durationchange' );

		audio.currentTime = 10;
		audio.duration = 20;
		audio.dispatchEvent( timeupdate );
		audio.dispatchEvent( durationchange );
		audio.play();

		assert.equal( component.get( 't' ), 10 );
		assert.equal( component.get( 'd' ), 0 ); // not 20, because read-only. Not sure how to test this!
		assert.equal( component.get( 'paused' ), true ); // ditto...
		component.destroy();
	}
};
