<script>
  $: items = [{ value: 'hello' }];

  function fn(value) {
		return true;
	}
</script>

{#each items.filter(fn) as item}
  <input bind:value={item.value} />
{/each}
