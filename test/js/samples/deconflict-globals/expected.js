import { SvelteComponent, init, safe_not_equal } from "svelte/internal";
import { onMount } from "svelte";

function instance($$self, $$props, $$invalidate) {
	let { foo = "bar" } = $$props;

	onMount(() => {
		alert(JSON.stringify(data()));
	});

	$$self.$set = $$props => {
		if ("foo" in $$props) $$invalidate("foo", foo = $$props.foo);
	};

	return { foo };
}

class Component extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, null, safe_not_equal, { foo: 0 });
	}
}

export default Component;