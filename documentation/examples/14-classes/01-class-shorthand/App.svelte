<script>
	let big = false;
</script>

<label>
	<input type=checkbox bind:checked={big}>
	big
</label>

<div class:big>
	some {big ? 'big' : 'small'} text
</div>

<style>
	.big {
		font-size: 4em;
	}
</style>