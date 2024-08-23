import { test } from '../../test';

export default test({
	async test({ assert, component, target }) {
		const promise = Promise.resolve().then(() => {
			component.answer = 42;
		});

		component.promise = promise;

		assert.htmlEqual(target.innerHTML, '<p>wait for it...</p>');

		return promise.then(() => {
			assert.htmlEqual(
				target.innerHTML,
				`
					<p>the answer is 42!</p>
				`
			);
		});
	}
});
