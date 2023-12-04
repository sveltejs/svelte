import { assert_ok, test } from '../../assert';

export default test({
	props: {},
	html: `
		<div style="display: contents; --rail-color: rgb(0, 0, 0); --track-color: rgb(255, 0, 0);">
			<div id="component1">
				<p class="svelte-q538ga">Slider1</p><span class="svelte-q538ga">Track</span>
			</div>
			<div style="display: contents; --rail-color: rgb(255, 255, 0); --track-color: rgb(255, 0, 255);">
				<div id="nest-component1">
					<p class="svelte-q538ga">Slider1</p><span class="svelte-q538ga">Track</span></div>
				</div>
			</div>
		<div style="display: contents; --rail-color: rgb(0, 255, 0); --track-color: rgb(0, 0, 255);">
			<div id="component2">
				<p class="svelte-q538ga">Slider2</p><span class="svelte-q538ga">Track</span>
			</div>
			<div style="display: contents; --rail-color: rgb(0, 255, 255); --track-color: rgb(255, 255, 255);">
				<div id="nest-component2">
					<p class="svelte-q538ga">Slider2</p><span class="svelte-q538ga">Track</span>
				</div>
			</div>
		</div>
	`,
	test({ target, window, assert }) {
		const rail_color1 = target.querySelector('#component1 p');
		const track_color1 = target.querySelector('#component1 span');
		const rail_color2 = target.querySelector('#component2 p');
		const track_color2 = target.querySelector('#component2 span');
		const nest_rail_color1 = target.querySelector('#nest-component1 p');
		const nest_track_color1 = target.querySelector('#nest-component1 span');
		const nest_rail_color2 = target.querySelector('#nest-component2 p');
		const nest_track_color2 = target.querySelector('#nest-component2 span');

		assert_ok(rail_color1);
		assert_ok(track_color1);
		assert_ok(rail_color2);
		assert_ok(track_color2);
		assert_ok(nest_rail_color1);
		assert_ok(nest_track_color1);
		assert_ok(nest_rail_color2);
		assert_ok(nest_track_color2);

		assert.equal(window.getComputedStyle(rail_color1).color, 'rgb(0, 0, 0)');
		assert.equal(window.getComputedStyle(track_color1).color, 'rgb(255, 0, 0)');
		assert.equal(window.getComputedStyle(rail_color2).color, 'rgb(0, 255, 0)');
		assert.equal(window.getComputedStyle(track_color2).color, 'rgb(0, 0, 255)');
		assert.equal(window.getComputedStyle(nest_rail_color1).color, 'rgb(255, 255, 0)');
		assert.equal(window.getComputedStyle(nest_track_color1).color, 'rgb(255, 0, 255)');
		assert.equal(window.getComputedStyle(nest_rail_color2).color, 'rgb(0, 255, 255)');
		assert.equal(window.getComputedStyle(nest_track_color2).color, 'rgb(255, 255, 255)');
		assert.equal(rail_color1.textContent, 'Slider1');
		assert.equal(rail_color2.textContent, 'Slider2');
		assert.equal(nest_rail_color1.textContent, 'Slider1');
		assert.equal(nest_rail_color2.textContent, 'Slider2');
	}
});
