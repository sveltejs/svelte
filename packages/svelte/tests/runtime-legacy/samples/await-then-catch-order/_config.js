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

	test({ assert, target }) {
		fulfil(42);

		return thePromise.then(() => {
			assert.htmlEqual(
				target.innerHTML,
				`
					<p>the value is 42</p><p>true!</p>
				`
			);
		});
	}
});
