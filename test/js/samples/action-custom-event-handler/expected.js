import {
	SvelteComponent,
	detach,
	element,
	init,
	insert,
	is_function,
	noop,
	safe_not_equal
} from "svelte/internal";

function create_fragment(ctx) {
	let button;
	let foo_action;

	return {
		c() {
			button = element("button");
			button.textContent = "foo";
		},
		m(target, anchor) {
			insert(target, button, anchor);
			foo_action = foo.call(null, button, ctx.foo_function) || ({});
		},
		p(changed, ctx) {
			if (is_function(foo_action.update) && changed.bar) foo_action.update.call(null, ctx.foo_function);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(button);
			if (foo_action && is_function(foo_action.destroy)) foo_action.destroy();
		}
	};
}

function handleFoo(bar) {
	console.log(bar);
}

function foo(node, callback) {

}

function instance($$self, $$props, $$invalidate) {
	let { bar } = $$props;
	const foo_function = () => handleFoo(bar);

	$$self.$set = $$props => {
		if ("bar" in $$props) $$invalidate("bar", bar = $$props.bar);
	};

	return { bar, foo_function };
}

class Component extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, ["bar"]);
	}
}

export default Component;