<script>
	import { proxy } from 'svelte';

	const inner = proxy({
		count: 0
	})

	const object = proxy({
		outer: {
			inner
		}
	});
</script>

<button onclick={() => inner.count += 1}>
	clicks: {object.outer.inner.count}
</button>
