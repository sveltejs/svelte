<script>
	export let count;
</script>

<input type='number' bind:value={count}>
<p>{typeof count} {count}</p>