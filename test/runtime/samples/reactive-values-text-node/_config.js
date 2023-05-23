import { create_deferred } from '../../../helpers';

let deferred;

export default {
	before_test() {
		deferred = create_deferred();
	},

	get props() {
		return { deferred };
	},

	html: '<div>same text</div>',

	async test({ assert, target }) {
		await deferred.promise;
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>same text text</div>
		`
		);
	}
};
