export default {
	html: `
	<div>
	<div><span class="name">item 1</span><span>something</span></div>
	<div><span class="name">item 2</span><span>something</span></div>
	<div><span class="name">item 3</span><span>something</span></div>
	</div>
	`,
	test({ assert, component, target }) {
		component.sortById = false;
		assert.htmlEqual( target.innerHTML, `
		<div>
		<div><span class="name">item 3</span><span>something</span></div>
		<div><span class="name">item 2</span><span>something</span></div>
		<div><span class="name">item 1</span><span>something</span></div>
		</div>
		`);
	}
};
