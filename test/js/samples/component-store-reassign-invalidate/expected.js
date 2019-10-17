import {
	SvelteComponent,
	append,
	detach,
	element,
	init,
	insert,
	listen,
	noop,
	safe_not_equal,
	set_data,
	space,
	subscribe,
	text
} from "svelte/internal";

import { writable } from "svelte/store";

function create_fragment(ctx) {
	let h1;
	let t0;
	let t1;
	let button;
	let dispose;

	return {
		c() {
			h1 = element("h1");
			t0 = text(ctx.$foo);
			t1 = space();
			button = element("button");
			button.textContent = "reset";
			dispose = listen(button, "click", ctx.click_handler);
		},
		m(target, anchor) {
			insert(target, h1, anchor);
			append(h1, t0);
			insert(target, t1, anchor);
			insert(target, button, anchor);
		},
		p(changed, ctx) {
			if (changed.$foo) set_data(t0, ctx.$foo);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(h1);
			if (detaching) detach(t1);
			if (detaching) detach(button);
			dispose();
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let $foo,
		$$unsubscribe_foo = noop,
		$$subscribe_foo = () => ($$unsubscribe_foo(), $$unsubscribe_foo = subscribe(foo, $$value => $$invalidate("$foo", $foo = $$value)), foo);

	$$self.$$.on_destroy.push(() => $$unsubscribe_foo());
	let foo = writable(0);
	$$subscribe_foo();
	const click_handler = () => $$subscribe_foo($$invalidate("foo", foo = writable(0)));
	return { foo, $foo, click_handler };
}

class Component extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, []);
	}
}

export default Component;