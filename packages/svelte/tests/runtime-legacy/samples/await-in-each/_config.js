import { test } from '../../test';

/** @type {(value: any) => void} */
let fulfil;

const thePromise = new Promise((f) => {
	fulfil = f;
});

const items = [
	{
		title: 'a title',
		data: thePromise
	}
];

export default test({
	get props() {
		return { items };
	},

	test({ assert, target }) {
		fulfil(42);

		return thePromise.then(async () => {
			assert.htmlEqual(
				target.innerHTML,
				`
					<p>a title: 42</p>
				`
			);
		});
	}
});
