<!-- https://eugenkiss.github.io/7guis/tasks#counter -->
<script>
	let count = 0;
</script>

<input type="number" bind:value={count} />
<button on:click={() => (count += 1)}>count</button>
