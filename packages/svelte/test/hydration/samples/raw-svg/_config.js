export default {
	snapshot(target) {
		const svg = target.querySelector('svg');

		return {
			svg,
			circle: svg.querySelector('circle')
		};
	},
	test(assert, _, snapshot) {
		assert.instanceOf(snapshot.svg, SVGElement);
		assert.instanceOf(snapshot.circle, SVGElement);
	}
};
