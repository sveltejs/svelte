import { tick } from 'svelte';

let value = 'initial';

let subscribers = [];
const observable = {
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

export default {
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
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>value: 42</p>');

		component.visible = false;

		assert.equal(subscribers.length, 0);
	}
};
