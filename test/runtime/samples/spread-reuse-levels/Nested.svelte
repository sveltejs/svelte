<script>
	import { beforeUpdate } from 'svelte';

	export let a, b, c;

	let changed = {};
	let previous = {};

	beforeUpdate(() => {
		changed.a = a !== previous.a;
		changed.b = b !== previous.b;
		changed.c = c !== previous.c;

		previous.a = a;
		previous.b = b;
		previous.c = c;
	});
</script>

<pre>{JSON.stringify({ a, b, c })}</pre>
<pre>{JSON.stringify(changed)}</pre>