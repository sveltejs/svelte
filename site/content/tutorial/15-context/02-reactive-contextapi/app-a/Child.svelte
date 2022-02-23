<script>
	import { getContext } from 'svelte';
	let count = getContext('count');
</script>

<p>Child's count is: {count}</p>

<button on:click={_=> count++}>Add Count</button>
