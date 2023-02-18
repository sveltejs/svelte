export default {
	html: `
		<button>click</button>
		<table>
			<tr>
				<td><span>1-a</span></td>
				<td><span>1-b</span></td>
				<td><span>1-c</span></td>
			</tr>
			<tr>
				<td><span>2-a</span></td>
				<td><span>2-b</span></td>
				<td><span>2-c</span></td>
			</tr>
			<tr>
				<td><span>3-a</span></td>
				<td><span>3-b</span></td>
				<td><span>3-c</span></td>
			</tr>
		</table>`,
	async test({ assert, target, window }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');
		await button.dispatchEvent(event);
		assert.htmlEqual(target.innerHTML, `
			<button>click</button>
			<table>
			  <tr>
				  <td><span>1-a</span></td>
					<td><span>1-c</span></td>
				</tr>
				<tr>
					<td><span>3-a</span></td>
					<td><span>3-c</span></td>
				</tr>
				<tr>
					<td><span>2-a</span></td>
					<td><span>2-c</span></td>
				</tr>
			</table>
		`);
	}
};
