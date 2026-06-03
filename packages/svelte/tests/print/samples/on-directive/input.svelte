<script lang="ts">
	let count = 0;

	function handleClick(event: MouseEvent) {
		count += 1;
	}
</script>

<button on:click|preventDefault={handleClick}>
	count: {count}
</button>
