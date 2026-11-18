import { test } from '../../test';

export default test({
	mode: ['client'],

	html: `<p>refused</p><p>refused</p><p>refused</p><p>refused</p><p>refused</p><p>refused</p><p>refused</p>`,

	test({ assert, instance }) {
		assert.equal(instance.model(), '[[[1,"a"]],[1]]');
	}
});
