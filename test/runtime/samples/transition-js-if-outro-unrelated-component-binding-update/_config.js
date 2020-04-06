export default {
	test({ assert, target, window, raf }) {
		target.querySelector("button").click();
		raf.tick(500);
		assert.htmlEqual(target.innerHTML, "");
	},
};
