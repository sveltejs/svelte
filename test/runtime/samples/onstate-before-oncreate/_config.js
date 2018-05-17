export default {
	'skip-ssr': true,

	test(assert, component, target) {
		assert.ok(component.onstateRanBeforeOncreate);
		assert.ok(!component.onupdateRanBeforeOncreate);
	}
};
