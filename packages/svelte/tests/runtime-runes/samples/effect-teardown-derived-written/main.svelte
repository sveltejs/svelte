<script>
		import { untrack } from 'svelte';

		let count = $state(0);
		let double = $derived(count * 2);

		$effect(() => {
			count;
			untrack(() => double);
			return () => {
				double = 42;
				console.log(double);
			};
		});
</script>

<button onclick={() => count++}>count++</button>
