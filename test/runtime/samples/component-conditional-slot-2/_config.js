export default {
	html: `
		<div>Slot A</div>
		4A
		<div>Slot B</div>
		4B
		<div>Slot C</div>
		<div>Fallback C</div>
		<div>Slot D</div>
	`,
	test({ assert, component, target }) {
		component.value = 1;
		assert.htmlEqual(target.innerHTML, `
			<div>Slot A</div>
			A
			<div>Slot B</div>
			<div>Fallback B</div>
			<div>Slot C</div>
			<div>Fallback C</div>
			<div>Slot D</div>
		`);

		component.value = 2;
		assert.htmlEqual(target.innerHTML, `
			<div>Slot A</div>
			2A
			<div>Slot B</div>
			2B
			<div>Slot C</div>
			2C
			<div>Slot D</div>
		`);

		component.value = 3;
		assert.htmlEqual(target.innerHTML, `
			<div>Slot A</div>
			3A
			<div>Slot B</div>
			3B
			<div>Slot C</div>
			<div>Fallback C</div>
			<div>Slot D</div>
		`);

		component.condition = false;
		assert.htmlEqual(target.innerHTML, `
			<div>Slot A</div>
			3A
			<div>Slot B</div>
			<div>Fallback B</div>
			<div>Slot C</div>
			<div>Fallback C</div>
			<div>Slot D</div>
			3D
		`);

		component.value = 4;
		assert.htmlEqual(target.innerHTML, `
			<div>Slot A</div>
			<div>Slot B</div>
			<div>Fallback B</div>
			<div>Slot C</div>
			<div>Fallback C</div>
			<div>Slot D</div>
		`);

		component.value = 5;
		assert.htmlEqual(target.innerHTML, `
			<div>Slot A</div>
			5A
			<div>Slot B</div>
			<div>Fallback B</div>
			<div>Slot C</div>
			<div>Fallback C</div>
			<div>Slot D</div>
		`);
	}
};
