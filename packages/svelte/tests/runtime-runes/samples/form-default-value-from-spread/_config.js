import { test } from '../../test';

export default test({
	mode: ['server'],
	html: `
		<input value="a">
		<input type="checkbox" checked>
		<input value="b">
`
});
