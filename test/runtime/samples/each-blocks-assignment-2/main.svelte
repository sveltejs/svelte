<script>
  let obj = {
    prop: "foo"
  };

  let arr = [obj]
</script>

{#each arr as o}
  <span class="content">{o.prop}</span>
  <button on:click={ () => o = { ...o, prop: "bar" } }>Test</button>
{/each}