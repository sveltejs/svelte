{#each await Promise.resolve([]) as item}
  {await Promise.reject('This should never be reached')}
{:else}
  {await Promise.resolve(4)}
{/each}
