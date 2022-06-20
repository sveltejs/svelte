<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
</script>

<button on:click='{() => dispatch("select", { selection: "foo" })}'>select foo</button>
<button on:click='{() => dispatch("select", { selection: "bar" })}'>select bar</button>
<button on:click='{() => dispatch("select", { selection: "baz" })}'>select baz</button>