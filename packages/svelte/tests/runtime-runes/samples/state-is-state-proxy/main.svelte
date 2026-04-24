<script>
	import { isStateProxy } from 'svelte/reactivity';

	let proxied = $state({ count: 0 });
	let plain = { count: 0 };
</script>

<div>{isStateProxy(proxied)} {isStateProxy(plain)} {isStateProxy(null)}</div>
<button onclick={() => (proxied.count += 1)}>{isStateProxy(proxied)} {proxied.count}</button>
