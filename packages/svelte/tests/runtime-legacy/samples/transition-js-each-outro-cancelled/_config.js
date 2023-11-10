import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<section></section>',
	test({ assert, component, target, raf }) {
		flushSync(() => {
			component.add();
			component.add();
		});

		let time = 0;

		raf.tick(0);

		assert.htmlEqual(
			target.innerHTML,
			`
			<section>
				<div t="0">Thing 1</div>
				<div t="0">Thing 2</div>
			</section>
		`
		);

		raf.tick((time += 400));

		assert.htmlEqual(
			target.innerHTML,
			`
			<section>
				<div t="1">Thing 1</div>
				<div t="1">Thing 2</div>
			</section>
		`
		);

		flushSync(() => {
			component.toggle();
		});
		// transition halfway
		raf.tick((time += 200));

		assert.htmlEqual(
			target.innerHTML,
			`
			<section t="0.5">
				<div t="1">Thing 1</div>
				<div t="1">Thing 2</div>
			</section>
		`
		);

		flushSync(() => {
			component.toggle();
		});
		// transition back
		raf.tick((time += 200));

		assert.htmlEqual(
			target.innerHTML,
			`
			<section t="1">
				<div t="1">Thing 1</div>
				<div t="1">Thing 2</div>
			</section>
		`
		);

		flushSync(() => {
			component.remove(1);
		});

		raf.tick((time += 400));

		assert.htmlEqual(
			target.innerHTML,
			`
			<section t="1">
				<div t="1">Thing 2</div>
			</section>
		`
		);
	}
});
