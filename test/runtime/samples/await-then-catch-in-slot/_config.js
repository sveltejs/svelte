import { create_deferred } from '../../../helpers.js';

let deferred;

export default {
	before_test() {
		deferred = create_deferred();
	},

	get props() {
		return { thePromise: deferred.promise };
	},

	html: `
		<p>loading...</p>
	`,

	async test({ assert, component, target }) {
		deferred.resolve(42);

		await deferred.promise;
		assert.htmlEqual(target.innerHTML, '<p>the value is 42</p>');

		deferred = create_deferred();
		component.thePromise = deferred.promise;
		assert.htmlEqual(target.innerHTML, '<p>loading...</p>');

		deferred.reject(new Error('something broke'));

		try {
			await deferred.promise;
		} catch {}

		assert.htmlEqual(target.innerHTML, '<p>oh no! something broke</p>');
	}
};
