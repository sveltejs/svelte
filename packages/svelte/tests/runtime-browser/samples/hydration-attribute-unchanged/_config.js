import { flushSync } from 'svelte';
import { assert_ok, test } from '../../assert';
import { record, shadowed } from './names.js';

/** @type {HTMLInputElement[]} */
let inputs;

/** @type {MutationObserver} */
let observer;

export default test({
	mode: ['hydrate'],

	before_test() {
		const target = document.querySelector('main');
		assert_ok(target);

		inputs = [...target.querySelectorAll('input')];
		for (const input of inputs) input.value = 'typed';

		// no element can have this name
		Object.defineProperty(target.querySelector('#local-name'), 'localName', { value: 'bad name' });

		record();

		observer = new MutationObserver(() => {});
		observer.observe(target, { attributes: true, subtree: true });
	},

	test({ assert, component, target }) {
		/** @param {Record<string, any>} [props] */
		const written = (props) => {
			if (props) flushSync(() => component.$set(props));
			return observer
				.takeRecords()
				.map((record) => `${record.target.nodeName.toLowerCase()} ${record.attributeName}`);
		};

		// `$effect.pre` runs while hydrating, `$effect` after it
		assert.deepEqual(written(), [
			'object id',
			'form name',
			'button disabled',
			'button hidden',
			'div data-pre',
			'div data-post'
		]);

		// after hydration, a new type is written even when the string is the same
		assert.deepEqual(written({ label: 2 }), ['div data-label']);
		assert.deepEqual(written({ label: 2 }), []);
		assert.deepEqual(written({ n: '1' }), ['div data-n']);
		assert.deepEqual(written({ on: false }), ['div data-active']);
		assert.deepEqual(written({ spread: { disabled: false, hidden: true, tabindex: -1 } }), [
			'button disabled'
		]);
		assert.deepEqual(written({ spread: { disabled: true, hidden: true, tabindex: -1 } }), [
			'button disabled'
		]);

		observer.disconnect();

		assert.deepEqual(shadowed, ['HTMLFormElement', 'HTMLCollection', 'HTMLObjectElement']);

		// no recovery
		assert.deepEqual([...target.querySelectorAll('input')], inputs);
		for (const input of inputs) assert.equal(input.value, 'typed');

		// `htmlEqual` needs `document.createElement` back
		target.querySelector('object')?.removeAttribute('id');

		assert.htmlEqual(
			target.innerHTML,
			`
				<form name="renamed"><input></form>
				<object title="named later"></object>
				<div data-n="1"></div> <p data-n="1"></p> <span data-n="1"></span>
				<div role="row" aria-rowindex="2" data-active="false" data-label="2" data-n="1" data-pre="2" data-post="2"></div>
				<a href="#top" tabindex="-1">x</a>
				<svg width="24" height="24" stroke-width="1.5" viewBox="0 0 24 24"></svg>
				<button disabled hidden tabindex="-1">x</button>
				<div id="local-name" data-n="1"><input></div>
				<form data-n="1"><input name="localName"></form>
				<form data-n="1"><input id="localName"></form>
				<form data-n="1"><input name="namespaceURI"></form>
				<xmlns data-n="1">x</xmlns><xmlns:ab data-n="1">x</xmlns:ab><svg><xmlns data-n="1"></xmlns></svg>
			`
		);

		const button = target.querySelector('button');
		assert_ok(button);
		assert.equal(button.disabled, true);
		assert.equal(button.hidden, true);
		assert.equal(button.tabIndex, -1);
		assert.equal(button.getAttribute('disabled'), '');
	}
});
