<script>
	import { magic } from 'svelte';

	const object = magic({ count: 0 });
</script>

<button onclick={() => object.count += 1}>
	clicks: {object.count}
</button>
