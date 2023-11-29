<script>
	import { proxy } from 'svelte';

	const object = proxy({ count: 0 });
</script>

<button onclick={() => object.count += 1}>
	clicks: {object.count}
</button>
