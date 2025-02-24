import * as $ from 'svelte/internal/server';

export default function Static_template_expression_evaluation($$payload) {
	let a = 1;
	let b = 2;
	let name = 'world';
	let count = 0;

	function Component() {} // placeholder component
	$$payload.out += `<h1>Hello, ${$.escape(name)}!</h1> <p>${$.escape(a)} + ${$.escape(b)} = ${$.escape(a + b)}</p> <button>Count is ${$.escape(count)}</button> <p>1 + 2 = 3</p> <p>Sum is ${$.escape((a, b, a + b))}</p> <p>${$.escape(a === 1 ? a : b)}</p> `;
	Component($$payload, { a, count, c: a + b });
	$$payload.out += `<!---->`;
}