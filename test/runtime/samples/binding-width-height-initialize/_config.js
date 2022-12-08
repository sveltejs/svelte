export default {
	async test({ assert, target }) {
		assert.htmlEqual(target.querySelector('.description').innerHTML, 'width:200, height:100');
	}
};
