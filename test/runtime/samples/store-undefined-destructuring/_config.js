import { writable } from '../../../../store';

export default {
	props: {
		store: writable({})
	},

	test({ assert, target }) {
		assert.htmlEqual(target.innerHTML, `
			<span>undefined</span>
		`);
	}
};
