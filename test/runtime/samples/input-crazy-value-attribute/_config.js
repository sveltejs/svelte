const create_random_character = () => String.fromCharCode(Math.floor(Math.random() * (126 - 35)) + 35);
const one_million = 1000000;
const crazy_value = Array.from({ length: one_million }, create_random_character).join('');

export default {
	skip_if_hydrate_from_ssr: true,
	skip_if_hydrate: true,
	skip_if_ssr: true,

	props: {
		value: crazy_value
	},

	test({ assert, target }) {
		const input = target.querySelector('input');
		assert.equal(input.value.length === one_million, true);
	}
};
