import { ok, test } from '../../test';

export default test({
	html: `
		<svg>
			<g>
				<circle class='red'/>
			</g>
		</svg>
	`,

	test({ assert, target }) {
		const circle = target.querySelector('circle');
		ok(circle);
		assert.equal(circle.getAttribute('class'), 'red');
	}
});
