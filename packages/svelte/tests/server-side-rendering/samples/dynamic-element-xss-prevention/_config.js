import { test } from '../../test';

export default test({
	props: {
		tag: 'svg onload=alert(1)'
	},
	error: 'dynamic_element_invalid_tag'
});
