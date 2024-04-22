<script>
	import { beforeUpdate } from 'svelte';

	export let item;
	export let foo = 'XX';

	beforeUpdate(() => {
		foo = item;
	});
</script>

<span>{foo}</span>
