import { test } from '../../test';

export default test({
	skip_if_ssr: 'permanent', // there's no class instance to retrieve in SSR mode

	html: '<div>has div: true</div>'
});
