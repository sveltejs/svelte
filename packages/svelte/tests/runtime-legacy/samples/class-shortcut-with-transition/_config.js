import { test } from '../../test';

export default test({
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
			'<p>foo</p><p class="red svelte-1yszte8 border" style="overflow: hidden; opacity: 0; border-top-width: 0.5px; border-bottom-width: 0.5px; min-height: 0;">bar</p>'
		);
		component.open = true;
		raf.tick(250);
		assert.htmlEqual(
			target.innerHTML,
			'<p>foo</p><p class="red svelte-1yszte8 border" style="">bar</p>'
		);
	}
});
