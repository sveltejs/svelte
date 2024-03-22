import { test } from '../../test';

export default test({
	skip_if_ssr: true,
	html: `
		<div><div>Value in child component: </div></div>
	`
});
