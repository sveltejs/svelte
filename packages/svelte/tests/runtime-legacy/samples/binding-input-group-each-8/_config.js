import { flushSync } from 'svelte';
import { test } from '../../test';

// https://github.com/sveltejs/svelte/issues/7884
export default test({
	test({ assert, target, component, window }) {
		let inputs = target.querySelectorAll('input');

		assert.htmlEqual(
			target.innerHTML,
			`
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
		`
		);

		const event = new window.Event('change');

		inputs[0].checked = true;
		inputs[0].dispatchEvent(event);
		flushSync();
		inputs[2].checked = true;
		inputs[2].dispatchEvent(event);
		flushSync();
		inputs[3].checked = true;
		inputs[3].dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
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
		`
		);

		component.update();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>{"foo":[1,3],"bar":[1],"qux":[]}</p>
			<h2>qux</h2>
			<ul>
				<li><label><input name="qux" type="checkbox" value="4"> 4</label></li>
				<li><label><input name="qux" type="checkbox" value="5"> 5</label></li>
				<li><label><input name="qux" type="checkbox" value="6"> 6</label></li>
			</ul>
		`
		);

		inputs = target.querySelectorAll('input');
		inputs[0].checked = true;
		inputs[0].dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>{"foo":[1,3],"bar":[1],"qux":[4]}</p>
			<h2>qux</h2>
			<ul>
				<li><label><input name="qux" type="checkbox" value="4"> 4</label></li>
				<li><label><input name="qux" type="checkbox" value="5"> 5</label></li>
				<li><label><input name="qux" type="checkbox" value="6"> 6</label></li>
			</ul>
		`
		);
		assert.equal(inputs[0].checked, true);
		assert.equal(inputs[1].checked, false);
		assert.equal(inputs[2].checked, false);
	}
});
