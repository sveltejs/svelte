<script>
	import { magic } from 'svelte';

	const inner = magic({
		count: 0
	})

	const object = magic({
		outer: {
			inner
		}
	});
</script>

<button onclick={() => inner.count += 1}>
	clicks: {object.outer.inner.count}
</button>
