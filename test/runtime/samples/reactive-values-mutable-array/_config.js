export default {
	html: `
		Array in Object: 2,0,1<br>
		Array in Array in Object: 6,5,3,4
	`,
	async test({ assert, target }) {
		await new Promise(res => setTimeout(res, 1));

		assert.htmlEqual(target.innerHTML, `
			Array in Object: 2,1,2<br>
			Array in Array in Object: 3,5,3,4
		`);
	}
};
