import { test } from '../../test';

export default test({
	get props() {
		return { array: [true, false] };
	},
	html: `
		<div>foo</div>
		<div>bar</div>
	`
});
