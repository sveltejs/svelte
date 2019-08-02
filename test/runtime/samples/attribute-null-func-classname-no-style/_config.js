export default {
	props: {
		testName: "testClassName"
	},

	html: `<div class="testClassName"></div>`,

	test({ assert, component, target }) {
		const div = target.querySelector('div');
		assert.equal(div.className, 'testClassName');

		component.testName = null;
		assert.equal(div.className, '');

		component.testName = undefined;
		assert.equal(div.className, '');

		component.testName = undefined + '';
		assert.equal(div.className, 'undefined');

		component.testName = null + '';
		assert.equal(div.className, 'null');

		component.testName = 1;
		assert.equal(div.className, '1');

		component.testName = 0;
		assert.equal(div.className, '0');

		component.testName = false;
		assert.equal(div.className, 'false');

		component.testName = true;
		assert.equal(div.className, 'true');

		component.testName = {};
		assert.equal(div.className, '[object Object]');

		component.testName = '';
		assert.equal(div.className, '');
	}
};
