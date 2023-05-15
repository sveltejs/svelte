export default {
	props: {
		componentName: 'Slider1'
	},
	html: `
		<div style="display: contents; --rail-color:rgb(0, 0, 0); --track-color:rgb(255, 0, 0);">
			<div id="component1">
				<p class="svelte-q538ga">Slider1</p><span class="svelte-q538ga">Track</span>
			</div>
			<div style="display: contents; --rail-color:rgb(255, 255, 0); --track-color:rgb(255, 0, 255);">
				<div id="nest-component1">
					<p class="svelte-q538ga">Slider1</p><span class="svelte-q538ga">Track</span></div>
				</div>
			</div>
		<div style="display: contents; --rail-color:rgb(0, 255, 0); --track-color:rgb(0, 0, 255);">
			<div id="component2">
				<p class="svelte-q538ga">Slider1</p><span class="svelte-q538ga">Track</span>
			</div>
			<div style="display: contents; --rail-color:rgb(255, 255, 0); --track-color:rgb(255, 0, 255);">
				<div id="nest-component2">
					<p class="svelte-q538ga">Slider1</p><span class="svelte-q538ga">Track</span>
				</div>
			</div>
		</div>
	`,
	test({ target, window, assert, component }) {
		function assert_slider_1() {
			const railColor1 = target.querySelector('#component1 p');
			const trackColor1 = target.querySelector('#component1 span');
			const railColor2 = target.querySelector('#component2 p');
			const trackColor2 = target.querySelector('#component2 span');
			const nestRailColor1 = target.querySelector('#nest-component1 p');
			const nestTrackColor1 = target.querySelector('#nest-component1 span');
			const nestRailColor2 = target.querySelector('#nest-component2 p');
			const nestTrackColor2 = target.querySelector('#nest-component2 span');

			assert.equal(window.getComputedStyle(railColor1).color, 'rgb(0, 0, 0)');
			assert.equal(window.getComputedStyle(trackColor1).color, 'rgb(255, 0, 0)');
			assert.equal(window.getComputedStyle(railColor2).color, 'rgb(0, 255, 0)');
			assert.equal(window.getComputedStyle(trackColor2).color, 'rgb(0, 0, 255)');
			assert.equal(window.getComputedStyle(nestRailColor1).color, 'rgb(255, 255, 0)');
			assert.equal(window.getComputedStyle(nestTrackColor1).color, 'rgb(255, 0, 255)');
			assert.equal(window.getComputedStyle(nestRailColor2).color, 'rgb(255, 255, 0)');
			assert.equal(window.getComputedStyle(nestTrackColor2).color, 'rgb(255, 0, 255)');
			assert.equal(railColor1.textContent, 'Slider1');
			assert.equal(railColor2.textContent, 'Slider1');
			assert.equal(nestRailColor1.textContent, 'Slider1');
			assert.equal(nestRailColor2.textContent, 'Slider1');
		}

		function assert_slider_2() {
			const railColor1 = target.querySelector('#component1 p');
			const trackColor1 = target.querySelector('#component1 span');
			const railColor2 = target.querySelector('#component2 p');
			const trackColor2 = target.querySelector('#component2 span');
			const nestRailColor1 = target.querySelector('#nest-component1 p');
			const nestTrackColor1 = target.querySelector('#nest-component1 span');
			const nestRailColor2 = target.querySelector('#nest-component2 p');
			const nestTrackColor2 = target.querySelector('#nest-component2 span');

			assert.equal(window.getComputedStyle(railColor1).color, 'rgb(0, 0, 0)');
			assert.equal(window.getComputedStyle(trackColor1).color, 'rgb(255, 0, 0)');
			assert.equal(window.getComputedStyle(railColor2).color, 'rgb(0, 255, 0)');
			assert.equal(window.getComputedStyle(trackColor2).color, 'rgb(0, 0, 255)');
			assert.equal(window.getComputedStyle(nestRailColor1).color, 'rgb(0, 255, 255)');
			assert.equal(window.getComputedStyle(nestTrackColor1).color, 'rgb(255, 255, 255)');
			assert.equal(window.getComputedStyle(nestRailColor2).color, 'rgb(0, 255, 255)');
			assert.equal(window.getComputedStyle(nestTrackColor2).color, 'rgb(255, 255, 255)');
			assert.equal(railColor1.textContent, 'Slider2');
			assert.equal(railColor2.textContent, 'Slider2');
			assert.equal(nestRailColor1.textContent, 'Slider2');
			assert.equal(nestRailColor2.textContent, 'Slider2');
		}

		assert_slider_1();
		component.componentName = 'Slider2';
		assert_slider_2();
		component.componentName = undefined;
		assert.equal(window.document.querySelector('div'), null);
		component.componentName = 'Slider1';
		assert_slider_1();
	}
};
