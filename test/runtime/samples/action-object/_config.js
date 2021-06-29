export default {
	html: `
		<button>action</button>
	`,
	async test({ assert, target, window }) {
		assert.equal(target.querySelector('button').foo, 'bar1337');
	}
};
