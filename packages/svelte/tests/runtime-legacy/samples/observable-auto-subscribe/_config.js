import { test } from '../../test';
import { flushSync } from 'svelte';

/** @type {string | number} */
let value = 'initial';

/** @type {Array<((value: any) => void)>} */
let subscribers = [];
const observable = {
	/** @param {(value: any) => void} fn */
	subscribe: (fn) => {
		subscribers.push(fn);

		fn(value);

		return {
			unsubscribe: () => {
				const i = subscribers.indexOf(fn);
				subscribers.splice(i, 1);
			}
		};
	}
};

export default test({
	before_test() {
		value = 'initial';
		subscribers = [];
	},

	get props() {
		return { observable, visible: false };
	},

	html: '',

	async test({ assert, component, target }) {
		assert.equal(subscribers.length, 0);

		component.visible = true;

		assert.equal(subscribers.length, 1);
		assert.htmlEqual(target.innerHTML, '<p>value: initial</p>');
		value = 42;
		subscribers.forEach((fn) => {
			fn(value);
		});
		flushSync();
		assert.htmlEqual(target.innerHTML, '<p>value: 42</p>');

		component.visible = false;

		assert.equal(subscribers.length, 0);
	}
});
