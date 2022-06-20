const components = [
	{
		name: 'One',
		source: 'one source'
	},
	{
		name: 'Two',
		source: 'two source'
	}
];

const selectedComponent = components[0];

export default {
	skip: true, // doesn't reflect real-world bug, maybe a JSDOM quirk

	props: {
		components,
		selectedComponent
	},

	html: `
		<select>
			<option value='[object Object]'>One.svelte</option>
			<option value='[object Object]'>Two.svelte</option>
		</select>

		<textarea></textarea>

		<pre>ONE SOURCE\nTWO SOURCE</pre>
	`,

	async test({ assert, component, target, window }) {
		const event = new window.MouseEvent('input');
		const textarea = target.querySelector('textarea');

		textarea.value = 'one source changed';
		await textarea.dispatchEvent(event);

		assert.equal(component.compiled, 'ONE SOURCE CHANGED\nTWO SOURCE');
		assert.htmlEqual(target.innerHTML, `
			<select>
				<option value='[object Object]'>One.svelte</option>
				<option value='[object Object]'>Two.svelte</option>
			</select>

			<textarea></textarea>

			<pre>ONE SOURCE CHANGED\nTWO SOURCE</pre>
		`);

		// const select = target.querySelector('select');
		// console.log(`select.options[0].selected`, select.options[0].selected)
		// console.log(`select.options[1].selected`, select.options[1].selected)
		// console.log(`select.value`, select.value)
		// console.log(`select.__value`, select.__value)
		// select.options[1].selected = true;
		// console.log(`select.options[0].selected`, select.options[0].selected)
		// console.log(`select.options[1].selected`, select.options[1].selected)
		// console.log(`select.value`, select.value)
		// console.log(`select.__value`, select.__value)
		// select.dispatchEvent(new window.Event('change'));
		component.selectedComponent = components[1];

		assert.equal(textarea.value, 'two source');

		textarea.value = 'two source changed';
		await textarea.dispatchEvent(event);

		assert.equal(component.compiled, 'ONE SOURCE CHANGED\nTWO SOURCE CHANGED');
		assert.htmlEqual(target.innerHTML, `
			<select>
				<option value='[object Object]'>One.svelte</option>
				<option value='[object Object]'>Two.svelte</option>
			</select>

			<textarea></textarea>

			<pre>ONE SOURCE CHANGED\nTWO SOURCE CHANGED</pre>
		`);
	}
};
