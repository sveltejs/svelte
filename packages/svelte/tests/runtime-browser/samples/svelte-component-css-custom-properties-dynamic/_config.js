import { test } from '../../assert';

export default test({
	props: {
		railColor1: 'black',
		trackColor1: 'red',
		railColor2: 'green',
		trackColor2: 'blue'
	},
	html: `
		<svelte-css-wrapper style="display: contents; --rail-color: black; --track-color: red;">
			<div id="slider-1">
				<p class="svelte-17ay6rc">Slider</p>
				<span class="svelte-17ay6rc">Track</span>
			</div>
		</svelte-css-wrapper>
		<svelte-css-wrapper style="display: contents; --rail-color: green; --track-color: blue;">
			<div id="slider-2">
				<p class="svelte-17ay6rc">Slider</p>
				<span class="svelte-17ay6rc">Track</span>
			</div>
		</svelte-css-wrapper>
	`,
	test({ component, assert, target }) {
		component.railColor1 = 'yellow';
		component.trackColor2 = 'orange';

		assert.htmlEqual(
			target.innerHTML,
			`
			<svelte-css-wrapper style="display: contents; --rail-color: yellow; --track-color: red;">
				<div id="slider-1">
					<p class="svelte-17ay6rc">Slider</p>
					<span class="svelte-17ay6rc">Track</span>
				</div>
			</svelte-css-wrapper>
			<svelte-css-wrapper style="display: contents; --rail-color: green; --track-color: orange;">
				<div id="slider-2">
					<p class="svelte-17ay6rc">Slider</p>
					<span class="svelte-17ay6rc">Track</span>
				</div>
			</svelte-css-wrapper>
		`
		);
	}
});
