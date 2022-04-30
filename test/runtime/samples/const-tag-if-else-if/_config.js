export default {
	html: `
		<div>20 x 40</div>
		<div>20 x 40</div>
	`,
	props: {
		boxes: [{ width: 20, height: 40 }]
	},
	async test({ component, target, assert }) {
		component.boxes = [{ width: 40, height: 70 }];
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>40 x 70</div>
			<div>40 x 70</div>
		`
		);
		
		component.boxes = [];

		assert.htmlEqual(target.innerHTML, '');

		component.boxes = [
			{ width: 20, height: 40 },
			{ width: 30, height: 50 }
		];

		assert.htmlEqual(
			target.innerHTML,
			`
		<div>20 x 40</div>
		<div>30 x 50</div>
		<div>20 x 40</div>
		<div>30 x 50</div>
		`
		);

		component.boxes = [
			{ width: 80, height: 70 },
			{ width: 90, height: 60 }
		];

		assert.htmlEqual(
			target.innerHTML,
			`
		<div>80 x 70</div>
		<div>90 x 60</div>
		<div>80 x 70</div>
		<div>90 x 60</div>
		`
		);

		component.boxes = [];
		assert.htmlEqual(target.innerHTML, '');
	}
};
