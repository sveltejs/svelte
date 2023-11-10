import { test } from '../../test';

export default test({
	skip_if_ssr: 'permanent', // uses oncreate

	html: '<p>2</p>'
});
