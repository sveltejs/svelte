import { Store } from '../../../../store.js';

class MyStore extends Store {
	setFilter(filter) {
		this.set({ filter });
	}

	toggleTodo(todo) {
		todo.done = !todo.done;
		this.set({ todos: this.get('todos') });
	}
}

const todos = [
	{
		description: 'Buy some milk',
		done: true,
	},
	{
		description: 'Do the laundry',
		done: true,
	},
	{
		description: "Find life's true purpose",
		done: false,
	}
];

const store = new MyStore({
	filter: 'all',
	todos
});

export default {
	store,

	html: `
		<div class='done'>Buy some milk</div>
		<div class='done'>Do the laundry</div>
		<div class='pending'>Find life's true purpose</div>
	`,

	test(assert, component, target) {
		store.setFilter('pending');

		assert.htmlEqual(target.innerHTML, `
			<div class='pending'>Find life's true purpose</div>
		`);

		store.toggleTodo(todos[1]);

		assert.htmlEqual(target.innerHTML, `
			<div class='pending'>Do the laundry</div>
			<div class='pending'>Find life's true purpose</div>
		`);

		store.setFilter('done');

		assert.htmlEqual(target.innerHTML, `
			<div class='done'>Buy some milk</div>
		`);
	}
};