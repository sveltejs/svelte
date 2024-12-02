<script>
	import Nested from './Nested.svelte';

	let value = { count: 1 };
</script>

<button on:click={() => value = { count: 1 }}>reassign</button>
<Nested primitive={value.count} object={value} />