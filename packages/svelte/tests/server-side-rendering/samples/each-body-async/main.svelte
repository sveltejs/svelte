{#each { length: 1 } as _}
  {@const data = await Promise.resolve("data")}
  {:else}
  {@const data = await Promise.resolve("data")}
{/each}
