let value = 'initial';

let subscribers = [];
let create_observable = () => ({
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
});

export default {
	get props() {
		value = 'initial';
		subscribers = [];
		return { observable: create_observable(), visible: false };
	},

	html: '',

	async test({ assert, component, target }) {
		assert.equal(subscribers.length, 0);

		component.visible = true;

		assert.equal(subscribers.length, 1);
		assert.htmlEqual(target.innerHTML, `<p>value: initial</p>`);

		subscribers.forEach((fn) => fn(42));

		assert.htmlEqual(target.innerHTML, `<p>value: 42</p>`);

		component.visible = false;

		assert.equal(subscribers.length, 0);
	}
};
