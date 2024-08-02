import { test } from '../../test';

export default test({
	html: '<p>wait for it...</p>',
	test({ assert, component, target }) {
		return component.promise.then(async () => {
			assert.htmlEqual(
				target.innerHTML,
				`
					<p>the answer is 42!</p>
					<p>the answer100 is 4200!</p>
				`
			);
		});
	}
});
