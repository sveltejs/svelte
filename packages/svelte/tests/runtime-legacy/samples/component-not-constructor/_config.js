import { test } from '../../test';

export default test({
	mode: ['client'],

	get props() {
		return { selected: false };
	},
	error: '$$component is not a function'
});
