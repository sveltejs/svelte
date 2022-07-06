export default {
	skip_if_hydrate_from_ssr: true,
	skip_if_hydrate: true,
	skip_if_ssr: true,

	test({ assert, target }) {
		const textarea = target.querySelector('textarea');
		assert.equal(textarea.value.length > 100_000, true);
	}
};
