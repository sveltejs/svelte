import { test } from '../../test';

export default test({
	skip_if_ssr: 'permanent', // there's no class instance to retrieve in SSR mode

	html: `
		<div>foo</div>
		<div>0 has foo: true</div>
		<div>foo</div>
		<div>1 has foo: true</div>
		<div>foo</div>
		<div>2 has foo: true</div>
	`
});
