import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true // Render in dev mode to check that the validation error is not thrown
	},
	withoutNormalizeHtml: 'only-strip-comments',
	html: `A B C D <pre>Testing
123          ;
    456</pre>`,
	ssrHtml: `A B C D <pre>Testing
123          ;
    456</pre>`
});
