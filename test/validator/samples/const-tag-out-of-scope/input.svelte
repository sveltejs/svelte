<script>
  export let array;
</script>

{#each array as a}
  {@const b = a + 1}
  <div />
{/each}

{b}