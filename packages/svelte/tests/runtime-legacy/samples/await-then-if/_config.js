import { test } from '../../test';

/** @type {(value: any) => void} */
let fulfil;

const thePromise = new Promise((f) => {
	fulfil = f;
});

export default test({
	get props() {
		return { thePromise };
	},

	async test({ assert, target }) {
		fulfil([]);

		await thePromise;

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>promise array is empty</p>
		`
		);
	}
});
