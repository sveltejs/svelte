import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

export default function Destructure_derived_arrays($$anchor) {
	let $$d = $.derived(() => ({})),
		a = $.derived(() => $.get($$d).a),
		b = $.derived(() => $.get($$d).b),
		c = $.derived(() => $.get($$d).c);

	let $$d_1 = $.derived(() => []),
		d = $.derived(() => {
			let [$$1, $$2, $$3] = $.get($$d_1);

			return $$1;
		}),
		e = $.derived(() => {
			let [$$1, $$2, $$3] = $.get($$d_1);

			return $$2;
		}),
		f = $.derived(() => {
			let [$$1, $$2, $$3] = $.get($$d_1);

			return $$3;
		});

	let $$d_2 = $.derived(() => []),
		g = $.derived(() => {
			let { g: $$4, h: $$5, i: [$$6] } = $.get($$d_2);

			return $$4;
		}),
		h = $.derived(() => {
			let { g: $$4, h: $$5, i: [$$6] } = $.get($$d_2);

			return $$5;
		}),
		j = $.derived(() => {
			let { g: $$4, h: $$5, i: [$$6] } = $.get($$d_2);

			return $$6;
		});

	let $$d_3 = $.derived(() => []),
		k = $.derived(() => {
			let { k: $$7, l: $$8, m: { n: [$$9] } } = $.get($$d_3);

			return $$7;
		}),
		l = $.derived(() => {
			let { k: $$7, l: $$8, m: { n: [$$9] } } = $.get($$d_3);

			return $$8;
		}),
		o = $.derived(() => {
			let { k: $$7, l: $$8, m: { n: [$$9] } } = $.get($$d_3);

			return $$9;
		});
}