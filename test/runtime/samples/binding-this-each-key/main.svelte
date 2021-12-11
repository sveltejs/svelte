<script>
  export let data = [ { id: "1" }, { id: "2" }, { id: "3" } ];
	
  export let refs = [];

  $: list = data.reverse()
</script>

{#each list as { id }, index (id)}
  <div bind:this={refs[index]}>
    content
  </div>
{/each}