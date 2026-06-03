{#if await Promise.resolve(false)}
  {await Promise.reject('no no no')}
{:else}
  {await Promise.resolve('yes yes yes')}
{/if}
