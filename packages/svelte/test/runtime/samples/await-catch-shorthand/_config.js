import { create_deferred } from '../../../helpers.js';

let deferred;

export default {
	before_test() {
		deferred = create_deferred();
	},

	get props() {
		return { thePromise: deferred.promise };
	},

	html: '',

	test({ assert, component, target }) {
		deferred.resolve(42);

		return deferred.promise
			.then(() => {
				assert.htmlEqual(target.innerHTML, '');

				deferred = create_deferred();

				component.thePromise = deferred.promise;

				assert.htmlEqual(target.innerHTML, '');

				deferred.reject(new Error('something broke'));

				return deferred.promise.catch(() => {});
			})
			.then(() => {
				assert.htmlEqual(target.innerHTML, '<p>oh no! something broke</p>');
			});
	}
};
