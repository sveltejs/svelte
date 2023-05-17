export default {
	get props() {
		return { open: false, border: true };
	},
	html: '<p>foo</p>',

	test({ assert, component, target, raf }) {
		component.open = true;
		raf.tick(100);
		assert.htmlEqual(
			target.innerHTML,
			'<p>foo</p><p class="red svelte-1yszte8 border" style="">bar</p>'
		);

		component.open = false;
		raf.tick(150);
		assert.htmlEqual(
			target.innerHTML,
			'<p>foo</p><p class="red svelte-1yszte8 border" style="animation: __svelte_1333973250_0 100ms linear 0ms 1 both;">bar</p>'
		);

		component.open = true;
		raf.tick(250);
		assert.htmlEqual(
			target.innerHTML,
			'<p>foo</p><p class="red svelte-1yszte8 border" style="">bar</p>'
		);
	}
};
