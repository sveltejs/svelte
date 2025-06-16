import * as $ from 'svelte/internal/server';

export default function Server_deriveds($$payload, $$props) {
	$.push();

	// destructuring stuff on the server needs a bit more code
	// so that every identifier is a function
	let stuff = { foo: true, bar: [1, 2, { baz: 'baz' }] };
	let { foo, bar: [a, b, { baz }] } = $.derived(() => stuff, true);
	let stuff2 = [1, 2, 3];
	let [d, e, f] = $.derived(() => stuff2, true);
	let count = 0;
	let double = $.derived(() => count * 2);
	let identifier = $.derived(() => count);
	let dot_by = $.derived(() => () => count);

	class Test {
		state = 0;
		#der = $.derived(() => this.state * 2);

		get der() {
			return this.#der();
		}

		set der($$value) {
			return this.#der($$value);
		}

		#der_by = $.derived(() => this.state);

		get der_by() {
			return this.#der_by();
		}

		set der_by($$value) {
			return this.#der_by($$value);
		}

		#identifier = $.derived(() => this.state);

		get identifier() {
			return this.#identifier();
		}

		set identifier($$value) {
			return this.#identifier($$value);
		}
	}

	const test = new Test();

	$$payload.out += `<!---->${$.escape(foo?.())} ${$.escape(a?.())} ${$.escape(b?.())} ${$.escape(baz?.())} ${$.escape(d?.())} ${$.escape(e?.())} ${$.escape(f?.())} 0 0 ${$.escape(dot_by?.())} ${$.escape(test.der)} ${$.escape(test.der_by)} ${$.escape(test.identifier)}`;
	$.pop();
}