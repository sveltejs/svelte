import { test } from '../../test';

export default test({
	props: {
		query: '<!--<script>alert(1)</script>'
	},
	transformError: (error) => ({ message: /** @type {Error} */ (error).message })
});
