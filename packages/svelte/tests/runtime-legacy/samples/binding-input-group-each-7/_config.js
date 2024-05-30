import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<input type="checkbox" value="a" data-index="x-1">
		<input type="checkbox" value="b" data-index="x-1">
		<input type="checkbox" value="c" data-index="x-1">
		<input type="checkbox" value="a" data-index="x-2">
		<input type="checkbox" value="b" data-index="x-2">
		<input type="checkbox" value="c" data-index="x-2">
		<input type="checkbox" value="a" data-index="y-1">
		<input type="checkbox" value="b" data-index="y-1">
		<input type="checkbox" value="c" data-index="y-1">
		<input type="checkbox" value="a" data-index="y-2">
		<input type="checkbox" value="b" data-index="y-2">
		<input type="checkbox" value="c" data-index="y-2">
		<input type="checkbox" value="a" data-index="z-1">
		<input type="checkbox" value="b" data-index="z-1">
		<input type="checkbox" value="c" data-index="z-1">
		<input type="checkbox" value="a" data-index="z-2">
		<input type="checkbox" value="b" data-index="z-2">
		<input type="checkbox" value="c" data-index="z-2">
	`,

	test({ assert, target, window }) {
		const inputs = target.querySelectorAll('input');
		const checked = new Set();

		/** @param {number} i */
		const checkInbox = (i) => {
			checked.add(i);
			inputs[i].checked = true;
			inputs[i].dispatchEvent(event);
		};

		for (let i = 0; i < 18; i++) {
			assert.equal(inputs[i].checked, checked.has(i));
		}

		const event = new window.Event('change');

		checkInbox(2);
		flushSync();
		for (let i = 0; i < 18; i++) {
			assert.equal(inputs[i].checked, checked.has(i));
		}

		checkInbox(12);
		flushSync();
		for (let i = 0; i < 18; i++) {
			assert.equal(inputs[i].checked, checked.has(i));
		}

		checkInbox(8);
		flushSync();
		for (let i = 0; i < 18; i++) {
			assert.equal(inputs[i].checked, checked.has(i));
		}
	}
});
