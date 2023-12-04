import { assert_ok, test } from '../../test';

export default test({
	snapshot(target) {
		const svg = target.querySelector('svg');
		assert_ok(svg);

		return {
			svg,
			circle: svg.querySelector('circle')
		};
	},
	test(assert, _, snapshot) {
		assert.instanceOf(snapshot.svg, SVGElement);
		assert.instanceOf(snapshot.circle, SVGElement);
	}
});
