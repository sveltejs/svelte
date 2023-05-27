export default {
	html: '',

	async test({ assert, component, target }) {
		component.visible = true;
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>b</div><div>b</div><div>c</div><div>c</div>
		`
		);
		assert.equal(component.items1[1], target.querySelector('div'));
		assert.equal(component.items2[1], target.querySelector('div:nth-child(2)'));
		assert.equal(component.items1[2], target.querySelector('div:nth-child(3)'));
		assert.equal(component.items2[2], target.querySelector('div:last-child'));
	}
};
