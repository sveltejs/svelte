import { test } from '../../test';

export default test({
	get props() {
		return {
			/** @type {Array<Record<string, any>>} */
			objectsArray: [
				{
					quote: 'q1',
					'wrong-quote': 'wq1',
					16: '16',
					17: '17',
					class: 'class'
				},
				{
					quote: 'q2',
					'wrong-quote': 'wq2',
					16: 'sixteen',
					17: 'seventeen',
					class: 'glass'
				},
				{
					quote: 'q3',
					'wrong-quote': 'wq3',
					16: 'seize',
					17: 'dix-sept',
					class: 'mass'
				}
			]
		};
	},

	html: `
    <p class="class">Quote: q1, Wrong Quote: wq1, 16: 16, 17: 17</p>
    <p class="glass">Quote: q2, Wrong Quote: wq2, 16: sixteen, 17: seventeen</p>
    <p class="mass">Quote: q3, Wrong Quote: wq3, 16: seize, 17: dix-sept</p>
	`,

	test({ assert, component, target }) {
		component.objectsArray = [
			{ quote: 'new-quote', 'wrong-quote': 'wq4', 16: 'ten+six', 17: 'ten+seven', role: 'role' }
		];
		assert.htmlEqual(
			target.innerHTML,
			`
			<p role="role">Quote: new-quote, Wrong Quote: wq4, 16: ten+six, 17: ten+seven</p>
		`
		);
	}
});
