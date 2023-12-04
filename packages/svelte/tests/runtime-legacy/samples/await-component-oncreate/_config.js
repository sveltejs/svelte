import { test } from '../../test';

const promise = Promise.resolve(42);

export default test({
	get props() {
		return { promise };
	},

	test({ assert, target }) {
		return promise.then(async () => {
			await Promise.resolve();
			await Promise.resolve();
			assert.htmlEqual(
				target.innerHTML,
				`
				<p>42</p>
				<p>true</p>
			`
			);
		});
	}
});
