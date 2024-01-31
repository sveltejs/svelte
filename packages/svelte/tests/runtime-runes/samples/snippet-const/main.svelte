<script>
  let count = $state(0);
</script>

{#snippet counter()}
  {@const doubled = count * 2}
  <button on:click={() => (count += 1)}>{doubled}</button>
{/snippet}

{@render counter()}
