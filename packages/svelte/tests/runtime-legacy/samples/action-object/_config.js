import { test } from '../../test';

export default test({
	html: `
		<button>action</button>
	`,
	async test({ assert, target }) {
		const button = /** @type {HTMLButtonElement & { foo: string }} */ (
			target.querySelector('button')
		);
		assert.equal(button.foo, 'bar1337');
	}
});
