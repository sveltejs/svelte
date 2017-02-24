export default {
	data: {
		item: {
			name: 'One',
			key: 'a'
		}
	},

	html: `
		<select>
			<option value="a">One</option>
			<option value="b">Two</option>
			<option value="c">Three</option>
		</select>
	`,

	test ( assert, component, target ) {
		component.set({ item:
			{
				name: 'One',
				key: 'a'
			}
		})

		assert.htmlEqual( target.innerHTML,`
			<select>
				<option value="a">One</option>
				<option value="b">Two</option>
				<option value="c">Three</option>
			</select>
		`);

		component.teardown();
		assert.htmlEqual( target.innerHTML, '' );
	}
};
