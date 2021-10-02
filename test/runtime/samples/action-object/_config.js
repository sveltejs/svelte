export default {
	html: `
		<button>action</button>
	`,
	async test({ assert, target }) {
		assert.equal(target.querySelector('button').foo, 'bar1337');
	}
};
