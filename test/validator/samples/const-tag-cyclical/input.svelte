<script>
  export let array;
</script>

{#each array as a}
  {@const b = a + c}
  {@const c = b + a}
{/each}