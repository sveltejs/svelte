import { test } from '../../test';

export default test({
	skip_mode: ['server', 'async-server'],

	html: `
		<div><div>Value in child component: </div></div>
	`
});
