import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<p>1</p>
		<p>2</p>
		<p>3</p>
		<p>4</p>
		<p>5</p>
		<p>6</p>

		<h1>Bag'ol stores</h1>
		<p>6</p>
		<p></p>
		<p></p>

		<button>Click me!</button>
	`,

	test({ assert, target, window }) {
		const button = target.querySelector('button');
		const clickEvent = new window.Event('click', { bubbles: true });
		button?.dispatchEvent(clickEvent);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>7</p>
			<p>8</p>
			<p>9</p>
			<p>10</p>
			<p>11</p>
			<p>12</p>

			<h1>Bag'ol stores</h1>
			<p>12</p>
			<p>14</p>
			<p>15</p>

			<button>Click me!</button>
		`
		);
	}
});
