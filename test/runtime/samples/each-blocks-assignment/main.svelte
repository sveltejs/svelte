<script>
  let obj = {
    prop: "foo"
  };

  let arr = [1, 2, 3]
</script>

<button on:click={() => arr = [...arr, arr.length + 1]}>Add</button>
{#each arr as o}
  <span class="content">{o}</span>
  <button on:click={() => { o *= 2; }}>Test</button>
{/each}