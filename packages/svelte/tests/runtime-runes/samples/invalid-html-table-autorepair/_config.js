import { test } from '../../test';

let console_error = console.error;

/**
 * @type {any[]}
 */
const log = [];

export default test({
	solo: true,
	compileOptions: {
		dev: true // enable validation to ensure it doesn't throw
	},

	html: `
		<table>
			<tbody>
				<tr>
					<td>works1</td>
				</tr>
			</tbody>
		</table>

		<table>
			<tbody>
				<tr>
					<td>works2</td>
				</tr>
				<tr>
					<td>works3</td>
				</tr>
			</tbody>
		</table>

		<table>
			<tbody>
				<tr>
					<td>works4</td>
				</tr>
			</tbody>
			<tbody>
				<tr>
					<td>works5</td>
				</tr>
			</tbody>
		</table>

		<table>
			<tbody>
				<tr>
					<td>works6</td>
				</tr>
			</tbody>
		</table>
`
});
