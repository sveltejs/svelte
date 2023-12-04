import { test } from '../../test';

export default test({
	get props() {
		return { foo: { bar: 42 } };
	},
	html: `
		<h1>42</h2>
	`
});
