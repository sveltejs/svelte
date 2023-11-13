import { test } from '../../test';

export default test({
	skip_if_ssr: 'permanent', // doesn't work in SSR
	html: '<div>object</div>'
});
