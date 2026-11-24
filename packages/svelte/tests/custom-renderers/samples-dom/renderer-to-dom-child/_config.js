import { flushSync } from 'svelte';
import { test } from '../../test-dom.test';

export default test({
	target: 'dom',
	html: '<div><p>before</p> <custom-root><b>hello</b></custom-root> <p>after</p></div>',
	test({ assert, component, target, serialize_dom }) {
		component.set_message('updated');
		flushSync();
		assert.equal(
			serialize_dom(target),
			'<div><p>before</p> <custom-root><b>updated</b></custom-root> <p>after</p></div>'
		);

		component.toggle();
		flushSync();
		assert.equal(serialize_dom(target), '<div><p>before</p>  <p>after</p></div>');

		component.toggle();
		flushSync();
		assert.equal(
			serialize_dom(target),
			'<div><p>before</p> <custom-root><b>updated</b></custom-root> <p>after</p></div>'
		);
	}
});
