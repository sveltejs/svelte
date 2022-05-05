<script>
	import { afterUpdate } from 'svelte';

	export let val = 1;
	export let increment;

	afterUpdate(() => {
		increment();
	});
</script>

<inner>
	{val}
</inner>