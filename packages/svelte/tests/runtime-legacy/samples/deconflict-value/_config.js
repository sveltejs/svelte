import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],

	html: `
		<p>Reactive: foo</p>
		<p>Value: foo</p>
	`
});
