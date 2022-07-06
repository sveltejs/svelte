export default {
	skip_if_hydrate_from_ssr: true,
	skip_if_hydrate: true,
	skip_if_ssr: true,

	test({ assert, target }) {
		const input = target.querySelector('input');
		assert.equal(input.value.length > 100_000, true);
	}
};
