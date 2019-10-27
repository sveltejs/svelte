import {
	SvelteComponent,
	append,
	detach,
	element,
	init,
	insert,
	noop,
	safe_not_equal,
	set_data,
	space,
	text
} from "svelte/internal";

function create_fragment(ctx) {
	let div0;
	let t7;
	let div1;
	let p3;
	let t8;
	let t9;

	return {
		c() {
			div0 = element("div");

			div0.innerHTML = `<p>Hello world</p> 
  <p>Hello ${world1}</p> 
  <p>Hello ${world2}</p>`;

			t7 = space();
			div1 = element("div");
			p3 = element("p");
			t8 = text("Hello ");
			t9 = text(ctx.world3);
		},
		m(target, anchor) {
			insert(target, div0, anchor);
			insert(target, t7, anchor);
			insert(target, div1, anchor);
			append(div1, p3);
			append(p3, t8);
			append(p3, t9);
		},
		p(changed, ctx) {
			if (changed.world3) set_data(t9, ctx.world3);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div0);
			if (detaching) detach(t7);
			if (detaching) detach(div1);
		}
	};
}

let world1 = "world";
let world2 = "world";

function instance($$self, $$props, $$invalidate) {
	const world3 = "world";

	function foo() {
		$$invalidate("world3", world3 = "svelte");
	}

	return { world3 };
}

class Component extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, []);
	}
}

export default Component;