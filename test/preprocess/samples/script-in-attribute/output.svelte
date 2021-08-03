<script>tag</script>

<div on:click={replaced}>
  this is {replaced}
</div>

<div
  use:action={replaced} 
  use:action="{replaced}"
  { ...replaced}
  class:foo="{replaced}"
  transition:fade
  in:fly={replaced}
/>

{#if replaced}
  {#each replaced as item}
  {:else}
    {#await replaced then { a }}
    {:catch error}
    {/await}
  {/each}
{:else if replaced}
  {#each replaced as item}
    {replaced}
  {/each}
{:else}
{/if}

{#each replaced as { as }}
  {replaced}
{/each}

<Component
  a={replaced}
  b="3[3+4)4"
  class="a {replaced} fds {replaced} df {replaced} qwe"
  >
  <div on:click on:bind> {replaced} {@debug replaced} {@html replaced} {replaced}</div>
</Component>