import { test } from '../../test';

/** @type {(value: any) => void} */
let fulfil;

export default test({
	get props() {
		return {
			promise: new Promise((f) => {
				fulfil = f;
			})
		};
	},
	intro: true,

	async test({ assert, target, component, raf }) {
		assert.htmlEqual(target.innerHTML, '<p class="pending" foo="0.0">loading...</p>');

		let time = 0;

		raf.tick((time += 50));
		assert.htmlEqual(target.innerHTML, '<p class="pending" foo="0.5">loading...</p>');

		await fulfil(42);

		assert.htmlEqual(
			target.innerHTML,
			`
			<p class="pending" foo="0.5">loading...</p>
			<p class="then" foo="0.0">42</p>
		`
		);

		// see the transition 30% complete
		raf.tick((time += 30));
		assert.htmlEqual(
			target.innerHTML,
			`
			<p class="pending" foo="0.2">loading...</p>
			<p class="then" foo="0.3">42</p>
		`
		);

		// completely transition in the {:then} block
		raf.tick((time += 70));
		assert.htmlEqual(
			target.innerHTML,
			`
			<p class="then" foo="1.0">42</p>
		`
		);

		// update promise #1
		component.promise = new Promise((f) => {
			fulfil = f;
		});
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`
			<p class="then" foo="1.0">42</p>
			<p class="pending" foo="0.0">loading...</p>
		`
		);

		raf.tick((time += 100));

		assert.htmlEqual(
			target.innerHTML,
			`
			<p class="pending" foo="1.0">loading...</p>
		`
		);

		await fulfil(43);
		assert.htmlEqual(
			target.innerHTML,
			`
			<p class="pending" foo="1.0">loading...</p>
			<p class="then" foo="0.0">43</p>
		`
		);

		raf.tick((time += 100));
		assert.htmlEqual(
			target.innerHTML,
			`
			<p class="then" foo="1.0">43</p>
		`
		);

		// update promise #2
		component.promise = new Promise((f) => {
			fulfil = f;
		});
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`
			<p class="then" foo="1.0">43</p>
			<p class="pending" foo="0.0">loading...</p>
		`
		);

		raf.tick((time += 50));

		assert.htmlEqual(
			target.innerHTML,
			`
			<p class="then" foo="0.5">43</p>
			<p class="pending" foo="0.5">loading...</p>
		`
		);

		await fulfil(44);
		assert.htmlEqual(
			target.innerHTML,
			`
			<p class="then" foo="0.5">44</p>
			<p class="pending" foo="0.5">loading...</p>
		`
		);

		raf.tick((time += 100));
		assert.htmlEqual(
			target.innerHTML,
			`
			<p class="then" foo="1.0">44</p>
		`
		);

		// update promise #3 - quick succession
		component.promise = new Promise((f) => {
			fulfil = f;
		});
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			`
			<p class="then" foo="1.0">44</p>
			<p class="pending" foo="0.0">loading...</p>
		`
		);

		raf.tick((time += 40));
		assert.htmlEqual(
			target.innerHTML,
			`
			<p class="then" foo="0.6">44</p>
			<p class="pending" foo="0.4">loading...</p>
		`
		);

		await fulfil(45);

		assert.htmlEqual(
			target.innerHTML,
			`
			<p class="then" foo="0.6">45</p>
			<p class="pending" foo="0.4">loading...</p>
		`
		);

		raf.tick((time += 20));
		assert.htmlEqual(
			target.innerHTML,
			`
			<p class="then" foo="0.8">45</p>
			<p class="pending" foo="0.2">loading...</p>
		`
		);

		component.promise = new Promise((f) => {
			fulfil = f;
		});
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`
			<p class="then" foo="0.8">45</p>
			<p class="pending" foo="0.2">loading...</p>
		`
		);

		raf.tick((time += 10));

		assert.htmlEqual(
			target.innerHTML,
			`
			<p class="then" foo="0.7">45</p>
			<p class="pending" foo="0.3">loading...</p>
		`
		);

		await fulfil(46);

		assert.htmlEqual(
			target.innerHTML,
			`
			<p class="then" foo="0.7">46</p>
			<p class="pending" foo="0.3">loading...</p>
		`
		);

		raf.tick((time += 10));
		assert.htmlEqual(
			target.innerHTML,
			`
			<p class="then" foo="0.8">46</p>
			<p class="pending" foo="0.2">loading...</p>
		`
		);

		raf.tick((time += 20));
		assert.htmlEqual(
			target.innerHTML,
			`
			<p class="then" foo="1.0">46</p>
		`
		);
	}
});
