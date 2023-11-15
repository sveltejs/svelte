import { test } from '../../test';

export default test({
	skip_if_ssr: 'permanent',
	skip_if_hydrate: 'permanent',
	html: `
		<my-custom-element>Hello World!</my-custom-element>
	`
});
