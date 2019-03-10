<script>
	let count = 0;
</script>

<!-- https://github.com/eugenkiss/7guis/wiki#counter -->
<input type=number bind:value={count}>
<button on:click="{() => count += 1}">count</button>