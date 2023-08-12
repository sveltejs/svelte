export default {
	html: `
		<div>12 120 70, 30+4=34</div>
		<div>35 350 120, 50+7=57</div>
		<div>48 480 140, 60+8=68</div>
	`,
	async test({ component, target, assert }) {
		component.constant = 20;

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>12 240 140, 60+4=64</div>
			<div>35 700 240, 100+7=107</div>
			<div>48 960 280, 120+8=128</div>
		`
		);

		component.boxes = [
			{ width: 3, height: 4 },
			{ width: 4, height: 5 },
			{ width: 5, height: 6 },
			{ width: 6, height: 7 }
		];

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>12 240 140, 60+4=64</div>
			<div>20 400 180, 80+5=85</div>
			<div>30 600 220, 100+6=106</div>
			<div>42 840 260, 120+7=127</div>
		`
		);
	}
};
