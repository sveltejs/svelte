import { test } from '../../test';

export default test({
	get props() {
		return {
			animals: ['adder', 'blue whale', 'chameleon']
		};
	},
	html: '<p>0: adder</p><p>1: blue whale</p><p>2: chameleon</p><!---->'
});
