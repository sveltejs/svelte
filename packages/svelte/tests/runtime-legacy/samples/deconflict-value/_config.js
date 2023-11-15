import { test } from '../../test';

export default test({
	skip_if_ssr: 'permanent',

	html: `
		<p>Reactive: foo</p>
		<p>Value: foo</p>
	`
});
