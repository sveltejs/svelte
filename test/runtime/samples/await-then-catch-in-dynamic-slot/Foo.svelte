<script>
  const states = ["pending", "then", "catch"];
</script>
{#each states as state} 
  {#if $$slots[state]}
    <slot name={state}></slot>
  {/if}
{/each}
