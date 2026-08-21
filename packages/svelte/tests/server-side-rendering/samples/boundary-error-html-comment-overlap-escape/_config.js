import { test } from '../../test';

export default test({
	props: {
		query: '<!--><!--->-->'
	},
	transformError: (error) => ({ message: /** @type {Error} */ (error).message })
});
