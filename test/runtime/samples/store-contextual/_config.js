import { writable } from '../../../../store';

const todos = [
	writable({ done: false, text: 'write docs' }),
	writable({ done: false, text: 'implement contextual stores' }),
	writable({ done: false, text: 'go outside' })
];

export default {
	error: `Stores must be declared at the top level of the component (this may change in a future version of Svelte)`,

	props: {
		todos
	},

	html: `
		<label>
			<input type=checkbox>
			[todo] write docs
		</label>

		<label>
			<input type=checkbox>
			[todo] implement contextual stores
		</label>

		<label>
			<input type=checkbox>
			[todo] go outside
		</label>
	`,

	async test({ assert, component, target, window }) {
		const inputs = target.querySelectorAll('input');
		const change = new window.MouseEvent('change');

		inputs[1].checked = true;
		await inputs[1].dispatchEvent(change);

		assert.htmlEqual(target.innerHTML, `
			<label>
				<input type=checkbox>
				[todo] write docs
			</label>

			<label>
				<input type=checkbox>
				[done] implement contextual stores
			</label>

			<label>
				<input type=checkbox>
				[todo] go outside
			</label>
		`);

		await todos[0].update(todo => ({ done: !todo.done, text: todo.text }));

		assert.htmlEqual(target.innerHTML, `
			<label>
				<input type=checkbox>
				[done] write docs
			</label>

			<label>
				<input type=checkbox>
				[done] implement contextual stores
			</label>

			<label>
				<input type=checkbox>
				[todo] go outside
			</label>
		`);
	}
};