<script>
  export let array = [1];
</script>

{#each array as a}
  {@const b = a + c}
  {@const c = b + a}
{/each}
