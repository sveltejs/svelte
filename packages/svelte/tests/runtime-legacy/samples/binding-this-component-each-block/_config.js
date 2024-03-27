import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'], // there's no class instance to retrieve in SSR mode

	html: `
		<div>foo</div>
		<div>0 has foo: true</div>
		<div>foo</div>
		<div>1 has foo: true</div>
		<div>foo</div>
		<div>2 has foo: true</div>
	`
});
