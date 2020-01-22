<script>
	let val;
</script>

<input bind:value={val} />
<slot {val}></slot>