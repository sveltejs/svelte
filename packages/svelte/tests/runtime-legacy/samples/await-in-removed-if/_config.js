import { test } from '../../test';

/** @type {(value?: any) => void} */
let fulfil;

const promise = new Promise((f) => {
	fulfil = f;
});

export default test({
	get props() {
		return { promise, condition: true };
	},

	html: '',

	async test({ assert, component, target }) {
		component.condition = false;

		fulfil();
		await new Promise((f) => setTimeout(f, 0));

		assert.htmlEqual(target.innerHTML, '');
	}
});
