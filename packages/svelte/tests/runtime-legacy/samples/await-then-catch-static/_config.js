import { test } from '../../test';

/** @type {(value: any) => void} */
let fulfil;

let promise = new Promise((f) => {
	fulfil = f;
});

export default test({
	get props() {
		return { promise };
	},

	test({ assert, component, target }) {
		fulfil(42);

		return promise
			.then(async () => {
				assert.htmlEqual(
					target.innerHTML,
					`
					<p>loaded</p>
				`
				);

				promise = new Promise((f, _) => {
					fulfil = f;
				});

				component.promise = promise;
				await Promise.resolve();

				assert.htmlEqual(
					target.innerHTML,
					`
					<p>loading...</p>
				`
				);

				fulfil(43);

				return promise.then(() => {});
			})
			.then(() => {
				assert.htmlEqual(
					target.innerHTML,
					`
					<p>loaded</p>
				`
				);
			});
	}
});
