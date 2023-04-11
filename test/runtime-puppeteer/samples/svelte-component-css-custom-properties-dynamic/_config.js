export default {
	props: {
		railColor1: 'black',
		trackColor1: 'red',
		railColor2: 'green',
		trackColor2: 'blue'
	},
	html: `
		<div style="display: contents; --rail-color:black; --track-color:red;">
			<div id="slider-1">
				<p class="svelte-17ay6rc">Slider</p>
				<span class="svelte-17ay6rc">Track</span>
			</div>
		</div>
		<div style="display: contents; --rail-color:green; --track-color:blue;">
			<div id="slider-2">
				<p class="svelte-17ay6rc">Slider</p>
				<span class="svelte-17ay6rc">Track</span>
			</div>
		</div>
	`,
	test({ component, assert, target }) {
		component.railColor1 = 'yellow';
		component.trackColor2 = 'orange';

		assert.htmlEqual(target.innerHTML, `
			<div style="display: contents; --rail-color:yellow; --track-color:red;">
				<div id="slider-1">
					<p class="svelte-17ay6rc">Slider</p>
					<span class="svelte-17ay6rc">Track</span>
				</div>
			</div>
			<div style="display: contents; --rail-color:green; --track-color:orange;">
				<div id="slider-2">
					<p class="svelte-17ay6rc">Slider</p>
					<span class="svelte-17ay6rc">Track</span>
				</div>
			</div>
		`);
	}
};
