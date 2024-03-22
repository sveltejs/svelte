import { test } from '../../test';

export default test({
	skip: true, // TODO: needs fixing

	skip_if_ssr: true,
	skip_if_hydrate: true,
	html: `
		<my-custom-inheritance-element>Hello World!</my-custom-inheritance-element>
	`
});
