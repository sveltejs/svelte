import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'], // there's no class instance to retrieve in SSR mode

	html: '<div>has div: true</div>'
});
