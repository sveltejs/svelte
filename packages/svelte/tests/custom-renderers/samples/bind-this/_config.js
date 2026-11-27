import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, serialize, dispatch_event }) {
		const find = (/** @type {string} */ name) =>
			target.children.filter((/** @type {any} */ n) => n.type === 'element' && n.name === name);

		const [toggle, pop, tag] = find('button');
		const output = () => serialize(find('output')[0]);

		flushSync();
		assert.equal(output(), '<output>p|div|a,b|section|i</output>');
		assert.equal(find('p')[0].name, 'p');

		dispatch_event(toggle, 'click');
		flushSync();
		assert.equal(output(), '<output>p|null|a,b|section|null</output>');

		dispatch_event(pop, 'click');
		flushSync();
		assert.equal(output(), '<output>p|null|a|section|null</output>');

		dispatch_event(toggle, 'click');
		flushSync();
		assert.equal(output(), '<output>p|div|a|section|i</output>');

		dispatch_event(tag, 'click');
		flushSync();
		assert.equal(output(), '<output>p|div|a|article|i</output>');
		assert.equal(find('section').length, 0);
		assert.equal(find('article').length, 1);

		dispatch_event(tag, 'click');
		flushSync();
		assert.equal(output(), '<output>p|div|a|section|i</output>');
	}
});
