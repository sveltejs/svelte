export default {
	props: {
		list: [
			{ id: 1 },
			{ id: 2 },
			{ id: 3, children: [{ id: 30 }, { id: 31 }, { id: 32 }] },
		],
		activeId: null,
	},

	html: `
		<ul>
			<li><span>1</span></li>
			<li><span>2</span></li>
			<li><span>3</span></li>
		</ul>
	`,

	test({ assert, component, target }) {
		component.activeId = 3;

		assert.htmlEqual(target.innerHTML, `
			<ul>
				<li><span>1</span></li>
				<li><span>2</span></li>
				<li>
					<span>3</span>
					<ul>
						<li><span>30</span></li>
						<li><span>31</span></li>
						<li><span>32</span></li>
					</ul>
				</li>
			</ul>
		`);


		component.activeId = null;

		assert.htmlEqual(target.innerHTML, `
			<ul>
				<li><span>1</span></li>
				<li><span>2</span></li>
				<li><span>3</span></li>
			</ul>
		`);
	}
};
