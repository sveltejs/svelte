{#if   condition} yes {:else} no {/if}

{#each items as item, i}
  <p>{i}: {item}</p>
{/each}

{#if condition}yes{:else}no{/if}

{#each items as item, i}<p>{i}: {item}</p>{/each}
