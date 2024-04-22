import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'], // doesn't work in SSR
	html: '<div>object</div>'
});
