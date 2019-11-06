import {
	SvelteComponent,
	append,
	detach,
	element,
	init,
	insert,
	listen,
	noop,
	run_all,
	safe_not_equal,
	set_data,
	space,
	text
} from "svelte/internal";

function create_fragment(ctx) {
	let p0;
	let button0;
	let t1;
	let button1;
	let t3;
	let p1;
	let t4;
	let t5;
	let button2;
	let dispose;

	return {
		c() {
			p0 = element("p");
			button0 = element("button");
			button0.textContent = "set handler 1";
			t1 = space();
			button1 = element("button");
			button1.textContent = "set handler 2";
			t3 = space();
			p1 = element("p");
			t4 = text(ctx.number);
			t5 = space();
			button2 = element("button");
			button2.textContent = "click";

			dispose = [
				listen(button0, "click", ctx.updateHandler1),
				listen(button1, "click", ctx.updateHandler2),
				listen(button2, "click", function () {
					ctx.clickHandler.apply(this, arguments);
				})
			];
		},
		m(target, anchor) {
			insert(target, p0, anchor);
			append(p0, button0);
			append(p0, t1);
			append(p0, button1);
			insert(target, t3, anchor);
			insert(target, p1, anchor);
			append(p1, t4);
			insert(target, t5, anchor);
			insert(target, button2, anchor);
		},
		p(changed, ctx) {
			if (changed.number) set_data(t4, ctx.number);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(p0);
			if (detaching) detach(t3);
			if (detaching) detach(p1);
			if (detaching) detach(t5);
			if (detaching) detach(button2);
			run_all(dispose);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let clickHandler;
	let number = 0;

	function updateHandler1() {
		$$invalidate("clickHandler", clickHandler = () => $$invalidate("number", number = 1));
	}

	function updateHandler2() {
		$$invalidate("clickHandler", clickHandler = () => $$invalidate("number", number = 2));
	}

	return {
		clickHandler,
		number,
		updateHandler1,
		updateHandler2
	};
}

class Component extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, {});
	}
}

export default Component;