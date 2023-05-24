export default {
	props: {
		railColor1: 'black',
		trackColor1: 'red',
		railColor2: 'green',
		trackColor2: 'blue',
		nestRailColor1: 'white',
		nestTrackColor1: 'gray',
		nestRailColor2: 'aqua',
		nestTrackColor2: 'pink'
	},
	html: `
		<div style="display: contents; --rail-color:black; --track-color:red;">
			<div id="slider-1">
				<p class="svelte-17ay6rc">Slider</p>
				<span class="svelte-17ay6rc">Track</span>
			</div>
			<div style="display: contents; --rail-color:white; --track-color:gray;">
				<div id="nest-slider-1">
					<p class="svelte-17ay6rc">Slider</p>
					<span class="svelte-17ay6rc">Track</span>
				</div>
			</div>
		</div>
		<div style="display: contents; --rail-color:green; --track-color:blue;">
			<div id="slider-2">
				<p class="svelte-17ay6rc">Slider</p>
				<span class="svelte-17ay6rc">Track</span>
			</div>
			<div style="display: contents; --rail-color:aqua; --track-color:pink;">
				<div id="nest-slider-2">
					<p class="svelte-17ay6rc">Slider</p>
					<span class="svelte-17ay6rc">Track</span>
				</div>
			</div>
		</div>
	`,
	test({ component, assert, target }) {
		component.railColor1 = 'yellow';
		component.trackColor2 = 'orange';
		component.nestRailColor1 = 'lime';
		component.nestTrackColor2 = 'gold';

		assert.htmlEqual(
			target.innerHTML,
			`
			<div style="display: contents; --rail-color:yellow; --track-color:red;">
				<div id="slider-1">
					<p class="svelte-17ay6rc">Slider</p>
					<span class="svelte-17ay6rc">Track</span>
				</div>
				<div style="display: contents; --rail-color:lime; --track-color:gray;">
					<div id="nest-slider-1">
						<p class="svelte-17ay6rc">Slider</p>
						<span class="svelte-17ay6rc">Track</span>
					</div>
				</div>
			</div>
			<div style="display: contents; --rail-color:green; --track-color:orange;">
				<div id="slider-2">
					<p class="svelte-17ay6rc">Slider</p>
					<span class="svelte-17ay6rc">Track</span>
				</div>
				<div style="display: contents; --rail-color:aqua; --track-color:gold;">
					<div id="nest-slider-2">
						<p class="svelte-17ay6rc">Slider</p>
						<span class="svelte-17ay6rc">Track</span>
					</div>
				</div>
			</div>
		`
		);
	}
};
