import { test } from '../../test';

export default test({
	html: '<div>10 x 34</div>',
	get props() {
		return { boxes: [{ width: 10, height: 34 }] };
	},
	async test({ component, target, assert }) {
		component.boxes = [{ width: 20, height: 40 }];

		assert.htmlEqual(
			target.innerHTML,
			`
		<div>20 x 40</div>
		`
		);

		component.boxes = [];
		assert.htmlEqual(target.innerHTML, '');

		component.boxes = [{ width: 18, height: 48 }];

		assert.htmlEqual(
			target.innerHTML,
			`
		<div>18 x 48</div>
		`
		);
	}
});
