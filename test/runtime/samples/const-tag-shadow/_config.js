export default {
	html: `
		<b>7</b>
		<u>11</u>
		<u>15</u>
		<i>7</i>
		<b>19</b>
		<u>23</u>
		<u>27</u>
		<i>19</i>
	`,
	async test({ component, target, assert }) {
		component.numbers = [
			{
				a: 4,
				b: 5, 
				children: [
					{ a: 6, b: 7 },
					{ a: 8, b: 9 }
				]
			},
			{
				a: 10,
				b: 11, 
				children: [
					{ a: 12, b: 13 },
					{ a: 14, b: 15 }
				]
			}
		];

		assert.htmlEqual(target.innerHTML, `
			<b>9</b>
			<u>13</u>
			<u>17</u>
			<i>9</i>
			<b>21</b>
			<u>25</u>
			<u>29</u>
			<i>21</i>
		`);
	}
};
