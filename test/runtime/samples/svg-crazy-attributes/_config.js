export default {
	skip_if_hydrate_from_ssr: true,
	skip_if_hydrate: true,
	skip_if_ssr: true,

	test({ assert, target }) {
		const image = target.querySelector('image');
		assert.equal(image.tagName, "IMAGE");
	}
};
