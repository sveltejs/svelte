<script>
	export let count;
</script>

<input type='range' bind:value={count}>
<p>{typeof count} {count}</p>