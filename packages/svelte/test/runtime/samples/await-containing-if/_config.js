import { create_deferred } from '../../../helpers.js';

let deferred;

export default {
	before_test() {
		deferred = create_deferred();
	},

	get props() {
		return { thePromise: deferred.promise, show: true };
	},

	html: `
		<div><p>loading...</p></div>
	`,

	test({ assert, component, target }) {
		deferred.resolve(42);

		return deferred.promise.then(() => {
			assert.htmlEqual(
				target.innerHTML,
				`
					<div><p>the value is 42</p></div>
				`
			);

			component.show = false;
			assert.htmlEqual(target.innerHTML, '<div></div>');

			component.show = true;
			assert.htmlEqual(
				target.innerHTML,
				`
					<div><p>the value is 42</p></div>
				`
			);
		});
	}
};
