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
		<p>4</p>
		<p>5</p>
		<p>6</p>

		<button>Click me!</button>
	`,

	async test({ assert, target, window }) {
		const button = target.querySelector('button');
		const clickEvent = new window.Event('click', { bubbles: true });
		await button?.dispatchEvent(clickEvent);

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
			<p>14</p>
			<p>13</p>
			<p>12</p>

			<button>Click me!</button>
		`
		);
	}
});
