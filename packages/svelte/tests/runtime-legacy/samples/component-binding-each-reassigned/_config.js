import { test } from '../../test';

export default test({
	html: `
		<p>2, 3, 4</p>
		<p>2</p>
		<p>3</p>
		<p>4</p>
		<p>2, 3, 4</p>
	`,

	ssrHtml: `
		<p>1, 2, 3</p>
		<p>2</p>
		<p>3</p>
		<p>4</p>
		<p>1, 2, 3</p>
	`
});
