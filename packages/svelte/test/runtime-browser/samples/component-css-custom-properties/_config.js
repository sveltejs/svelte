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
		const rail_color1 = target.querySelector('#slider-1 p');
		const track_color1 = target.querySelector('#slider-1 span');
		const rail_color2 = target.querySelector('#slider-2 p');
		const track_color2 = target.querySelector('#slider-2 span');

		assert.htmlEqual(window.getComputedStyle(rail_color1).color, 'rgb(0, 0, 0)');
		assert.htmlEqual(window.getComputedStyle(track_color1).color, 'rgb(255, 0, 0)');
		assert.htmlEqual(window.getComputedStyle(rail_color2).color, 'rgb(0, 255, 0)');
		assert.htmlEqual(window.getComputedStyle(track_color2).color, 'rgb(0, 0, 255)');
	}
};
