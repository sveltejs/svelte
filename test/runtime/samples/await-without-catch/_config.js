import { create_deferred } from '../../../helpers.js';

let deferred;

export default {
	before_test() {
		deferred = create_deferred();
	},

	get props() {
		return { promise: deferred.promise };
	},

	html: `
		<p>loading...</p>
	`,

	expect_unhandled_rejections: true,
	test({ assert, component, target }) {
		deferred.resolve(42);

		return deferred.promise
			.then(() => {
				assert.htmlEqual(target.innerHTML, '<p>loaded</p>');

				deferred = create_deferred();

				component.promise = deferred.promise;

				assert.htmlEqual(target.innerHTML, '<p>loading...</p>');

				deferred.reject(new Error('this error should be thrown'));

				return deferred.promise;
			})
			.catch((err) => {
				assert.equal(err.message, 'this error should be thrown');
				assert.htmlEqual(target.innerHTML, '');
			});
	}
};
