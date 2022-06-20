const tasks = [
	{ description: 'put your left leg in', done: false },
	{ description: 'your left leg out', done: false },
	{ description: 'in, out, in, out', done: false },
	{ description: 'shake it all about', done: false }
];

export default {
	skip_if_ssr: true,

	props: {
		tasks,
		selected: tasks[0]
	},

	html: `
		<select>
			<option value='[object Object]'>put your left leg in</option>
			<option value='[object Object]'>your left leg out</option>
			<option value='[object Object]'>in, out, in, out</option>
			<option value='[object Object]'>shake it all about</option>
		</select>

		<label>
			<input type='checkbox'> put your left leg in
		</label>

		<h2>Pending tasks</h2>
		<p>put your left leg in</p>
		<p>your left leg out</p>
		<p>in, out, in, out</p>
		<p>shake it all about</p>
	`,

	async test({ assert, component, target, window }) {
		const input = target.querySelector('input');
		const select = target.querySelector('select');
		const options = target.querySelectorAll('option');

		const change = new window.Event('change');

		input.checked = true;
		await input.dispatchEvent(change);

		assert.ok(component.tasks[0].done);
		assert.htmlEqual(target.innerHTML, `
			<select>
				<option value='[object Object]'>put your left leg in</option>
				<option value='[object Object]'>your left leg out</option>
				<option value='[object Object]'>in, out, in, out</option>
				<option value='[object Object]'>shake it all about</option>
			</select>

			<label>
				<input type='checkbox'> put your left leg in
			</label>

			<h2>Pending tasks</h2>
			<p>your left leg out</p>
			<p>in, out, in, out</p>
			<p>shake it all about</p>
		`);

		options[1].selected = true;
		await select.dispatchEvent(change);
		assert.equal(component.selected, tasks[1]);
		assert.ok(!input.checked);

		input.checked = true;
		await input.dispatchEvent(change);

		assert.ok(component.tasks[1].done);
		assert.htmlEqual(target.innerHTML, `
			<select>
				<option value='[object Object]'>put your left leg in</option>
				<option value='[object Object]'>your left leg out</option>
				<option value='[object Object]'>in, out, in, out</option>
				<option value='[object Object]'>shake it all about</option>
			</select>

			<label>
				<input type='checkbox'> your left leg out
			</label>

			<h2>Pending tasks</h2>
			<p>in, out, in, out</p>
			<p>shake it all about</p>
		`);
	}
};
