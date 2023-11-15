import { test } from '../../test';

export default test({
	props: {
		foo: "<p>this should be <em>escaped</em> & so should 'this'</p>"
	}
});
