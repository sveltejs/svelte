// https://github.com/sveltejs/svelte/issues/7884
export default {
	async test({ assert, target, component, window }) {
		let inputs = target.querySelectorAll('input');

		assert.htmlEqual(target.innerHTML, `
			<p>{"foo":[],"bar":[]}</p>
			<h2>foo</h2>
			<ul>
				<li><label><input name="foo" type="checkbox" value="1"> 1</label></li>
				<li><label><input name="foo" type="checkbox" value="2"> 2</label></li>
				<li><label><input name="foo" type="checkbox" value="3"> 3</label></li>
			</ul>
			<h2>bar</h2>
			<ul>
				<li><label><input name="bar" type="checkbox" value="1"> 1</label></li>
				<li><label><input name="bar" type="checkbox" value="2"> 2</label></li>
				<li><label><input name="bar" type="checkbox" value="3"> 3</label></li>
			</ul>
		`);

		const event = new window.Event('change');

		inputs[0].checked = true;
		await inputs[0].dispatchEvent(event);
		inputs[2].checked = true;
		await inputs[2].dispatchEvent(event);
		inputs[3].checked = true;
		await inputs[3].dispatchEvent(event);

		assert.htmlEqual(target.innerHTML, `
			<p>{"foo":[1,3],"bar":[1]}</p>
			<h2>foo</h2>
			<ul>
				<li><label><input name="foo" type="checkbox" value="1"> 1</label></li>
				<li><label><input name="foo" type="checkbox" value="2"> 2</label></li>
				<li><label><input name="foo" type="checkbox" value="3"> 3</label></li>
			</ul>
			<h2>bar</h2>
			<ul>
				<li><label><input name="bar" type="checkbox" value="1"> 1</label></li>
				<li><label><input name="bar" type="checkbox" value="2"> 2</label></li>
				<li><label><input name="bar" type="checkbox" value="3"> 3</label></li>
			</ul>		
		`);
		
		await component.update();

		assert.htmlEqual(target.innerHTML, `
			<p>{"foo":[1,3],"bar":[1],"qux":[]}</p>
			<h2>qux</h2>
			<ul>
				<li><label><input name="qux" type="checkbox" value="4"> 4</label></li>
				<li><label><input name="qux" type="checkbox" value="5"> 5</label></li>
				<li><label><input name="qux" type="checkbox" value="6"> 6</label></li>
			</ul>
		`);

		inputs = target.querySelectorAll('input');
		inputs[0].checked = true;
		await inputs[0].dispatchEvent(event);

		assert.htmlEqual(target.innerHTML, `
			<p>{"foo":[1,3],"bar":[1],"qux":[4]}</p>
			<h2>qux</h2>
			<ul>
				<li><label><input name="qux" type="checkbox" value="4"> 4</label></li>
				<li><label><input name="qux" type="checkbox" value="5"> 5</label></li>
				<li><label><input name="qux" type="checkbox" value="6"> 6</label></li>
			</ul>
		`);
		assert.equal(inputs[0].checked, true);
		assert.equal(inputs[1].checked, false);
		assert.equal(inputs[2].checked, false);
	}
};


