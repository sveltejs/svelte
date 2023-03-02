export default {
	html: `
		<div>12 120 70, 30+4=34</div>
		<div>12 120 70, 30+4=34</div>
		<div>12 120 70, 30+4=34</div>
		<div slot="box1">
			<div>12 120 70, 30+4=34</div>
		</div>
		<div slot="box2">
			<div>12 120 70, 30+4=34</div>
		</div>
		<div>12 120 70, 30+4=34</div>
		<div>12 120 70, 30+4=34</div>
	`,
	async test({ component, target, assert }) {
		component.constant = 20;
		assert.htmlEqual(target.innerHTML, `
			<div>12 240 140, 60+4=64</div>
			<div>12 240 140, 60+4=64</div>
			<div>12 240 140, 60+4=64</div>
			<div slot="box1">
				<div>12 240 140, 60+4=64</div>
			</div>
			<div slot="box2">
				<div>12 240 140, 60+4=64</div>
			</div>
			<div>12 240 140, 60+4=64</div>
			<div>12 240 140, 60+4=64</div>
		`);

		component.box = {width: 5, height: 6};
		assert.htmlEqual(target.innerHTML, `
			<div>30 600 220, 100+6=106</div>
			<div>30 600 220, 100+6=106</div>
			<div>30 600 220, 100+6=106</div>
			<div slot="box1">
				<div>30 600 220, 100+6=106</div>
			</div>
			<div slot="box2">
				<div>30 600 220, 100+6=106</div>
			</div>
			<div>30 600 220, 100+6=106</div>
			<div>30 600 220, 100+6=106</div>
		`);
	}
};
