export default {
	html: `
		<div style="display: contents; --rail-color:rgb(0, 0, 0); --track-color:rgb(255, 0, 0);">
			<div id="slider-1">
				<p class="svelte-17ay6rc">Slider</p>
				<span class="svelte-17ay6rc">Track</span>
			</div>
		</div>
		<div style="display: contents; --rail-color:rgb(0, 255, 0); --track-color:rgb(0, 0, 255);">
			<div id="slider-2">
				<p class="svelte-17ay6rc">Slider</p>
				<span class="svelte-17ay6rc">Track</span>
			</div>
		</div>
	`,
	test({ target, window, assert }) {
		const railColor1 = target.querySelector('#slider-1 p');
		const trackColor1 = target.querySelector('#slider-1 span');
		const railColor2 = target.querySelector('#slider-2 p');
		const trackColor2 = target.querySelector('#slider-2 span');

		assert.htmlEqual(window.getComputedStyle(railColor1).color, 'rgb(0, 0, 0)');
		assert.htmlEqual(window.getComputedStyle(trackColor1).color, 'rgb(255, 0, 0)');
		assert.htmlEqual(window.getComputedStyle(railColor2).color, 'rgb(0, 255, 0)');
		assert.htmlEqual(window.getComputedStyle(trackColor2).color, 'rgb(0, 0, 255)');
	}
};
