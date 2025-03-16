import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],
	recover: true,
	runtime_error: 'invalid_html_structure'
});
