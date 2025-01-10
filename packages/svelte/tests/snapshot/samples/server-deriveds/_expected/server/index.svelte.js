import * as $ from 'svelte/internal/server';

export default function Server_deriveds($$payload, $$props) {
	$.push();

	// destructuring stuff on the server needs a bit more code
	// so that every identifier is a function
	let stuff = { foo: true, bar: [1, 2, { baz: 'baz' }] };

	let {
			foo: foo_1,
			bar: [a_1, b_1, { baz: baz_1 }]
		} = stuff,
		foo = () => foo_1,
		a = () => a_1,
		b = () => b_1,
		baz = () => baz_1;

	let stuff2 = [1, 2, 3];

	let [d_1, e_1, f_1] = stuff2,
		d = () => d_1,
		e = () => e_1,
		f = () => f_1;

	let count = 0;
	let double = () => count * 2;
	let identifier = () => count;
	let dot_by = () => () => count;

	class Test {
		state = 0;
		#der = () => this.state * 2;

		get der() {
			return this.#der();
		}

		#der_by = () => this.state;

		get der_by() {
			return this.#der_by();
		}

		#identifier = () => this.state;

		get identifier() {
			return this.#identifier();
		}
	}

	const test = new Test();

	$$payload.out += `<!---->${$.escape(foo?.())} ${$.escape(a?.())} ${$.escape(b?.())} ${$.escape(baz?.())} ${$.escape(d?.())} ${$.escape(e?.())} ${$.escape(f?.())} ${$.escape(double?.())} ${$.escape(identifier?.())} ${$.escape(dot_by?.())} ${$.escape(test.der)} ${$.escape(test.der_by)} ${$.escape(test.identifier)}`;
	$.pop();
}