export default {
	// not sure if we can really test this in JSDOM. Refer to
	// https://svelte.technology/repl?example=media-elements
	// instead
	skip: true,

	test({ assert, component, target, window }) {
		assert.equal(component.t, 0);
		assert.equal(component.d, 0);
		assert.equal(component.v, 0.5);
		assert.equal(component.r, 1);
		assert.equal(component.paused, true);

		const audio = target.querySelector('audio');
		const timeupdate = new window.Event('timeupdate');
		const durationchange = new window.Event('durationchange');
		const volumechange = new window.Event('volumechange');
		const ratechange = new window.Event('ratechange');

		audio.currentTime = 10;
		audio.duration = 20;
		audio.volume = 0.75;
		audio.playbackRate = 2;
		audio.dispatchEvent(timeupdate);
		audio.dispatchEvent(durationchange);
		audio.dispatchEvent(volumechange);
		audio.dispatchEvent(ratechange);
		audio.play();

		assert.equal(component.t, 10);
		assert.equal(component.d, 0); // not 20, because read-only. Not sure how to test this!
		assert.equal(component.v, 0.75);
		assert.equal(component.r, 2);
		assert.equal(component.paused, true); // ditto...
	}
};
