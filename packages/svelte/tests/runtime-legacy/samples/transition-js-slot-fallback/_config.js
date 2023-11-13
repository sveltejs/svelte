import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<div>Foo</div>
	`,

	test({ assert, component, target, raf }) {
		flushSync(() => {
			component.hide();
		});
		const div = /** @type {HTMLDivElement & { foo: number }} */ (target.querySelector('div'));

		raf.tick(50);
		assert.equal(div.foo, 0.5);

		flushSync(() => {
			component.show();
		});

		assert.htmlEqual(target.innerHTML, '<div>Bar</div>');

		raf.tick(75);
		assert.equal(div.foo, 0.75);

		raf.tick(100);
		assert.equal(div.foo, 1);
	}
});
