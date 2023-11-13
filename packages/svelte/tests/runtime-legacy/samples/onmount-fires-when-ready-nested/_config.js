import { test } from '../../test';

export default test({
	skip_if_ssr: 'permanent', // uses oncreate

	html: '<div><p>true</p>\n<p>true</p></div>'
});
