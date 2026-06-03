{#if await Promise.resolve(true)}
  {await Promise.resolve('yes yes yes')}
{:else}
  {await Promise.reject('no no no')}
{/if}
