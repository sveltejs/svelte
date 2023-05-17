export default {
	get props() {
		return {
			state: 'deconflicted',
			states: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', '...and some others']
		};
	},

	html: `
		<p>Current state: deconflicted</p>

		<ul>
			<li>Alabama</li>
			<li>Alaska</li>
			<li>Arizona</li>
			<li>Arkansas</li>
			<li>...and some others</li>
		</ul>
	`,

	test({ assert, component, target }) {
		component.states = [
			'Maine',
			'Maryland',
			'Massachusetts',
			'Michigan',
			'Minnesota',
			'Mississippi',
			'Missouri',
			'Montana'
		];

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>Current state: deconflicted</p>

			<ul>
				<li>Maine</li>
				<li>Maryland</li>
				<li>Massachusetts</li>
				<li>Michigan</li>
				<li>Minnesota</li>
				<li>Mississippi</li>
				<li>Missouri</li>
				<li>Montana</li>
			</ul>
		`
		);
	}
};
