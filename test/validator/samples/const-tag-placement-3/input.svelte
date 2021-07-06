<script>
  export let a;
</script>

{#each a as i}
  <div>
    {@const b = i}
  </div>
{/each}