<script>
	import { onMount } from 'svelte';

	let a = 1, b = 2, c = 3;

	onMount(() => {
		const interval = setInterval(() => {
			b += 1;
			c += 1;

			console.log(b, c);
		}, 1000);

		return () => clearInterval(interval);
	});

	$: x = a * 2;
	$: y = b * 2;
</script>

<p>{y}</p>