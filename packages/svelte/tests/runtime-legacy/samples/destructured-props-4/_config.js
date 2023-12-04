import { test } from '../../test';

export default test({
	html: `
		<div>a: 1, b: undefined, c: 2, d_one: 3, d_three: 5, length: 2, f: , g: 9, e: undefined, e_one: 6, A: 1, C: 2</div>
		<div>{"a":1,"b":{"c":2,"d":[3,4,{},6,7]},"e":[6],"h":8}</div>
		<br>
		<div>a: a, b: undefined, c: 2, d_one: d_one, d_three: 5, length: 7, f: f, g: g, e: undefined, e_one: 6, A: 1, C: 2</div>
		<div>{"a":1,"b":{"c":2,"d":[3,4,{},6,7]},"e":[6],"h":8}</div>
	`
});
