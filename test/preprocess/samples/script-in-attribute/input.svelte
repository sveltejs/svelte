<script>
  let a = 1;
</script>

<div on:click={() => { return a?.b?.c; }}>
  this is {a#c}
</div>

<div
  use:action={{ foo: 1 }} 
  use:action="{ foo: 1 }"
  { ...asdf[123]["qwe(((("]() }
  class:foo="{123}"
  transition:fade
  in:fly={{ y: 10 }}
/>

{#if a}
  {#each array['a`[x']["]]]]]]"]['[[[['] as item}
  {:else}
    {#await getPromise().[foo()]['"a"'] then { a }}
    {:catch error}
    {/await}
  {/each}
{:else if b}
  {#each array[123](f, y, z) as item}
    { [([(a['asdf](((}}}[][!@#asdf}}}}'])])] + foo }
  {/each}
{:else}
{/if}

{#each foo          as { as }}
  {as}
{/each}

<Component
  a={foo > 32 + { a: 1}}
  b="3[3+4)4"
  class="a {b} fds {c[123]} df {{ a: 3 }[`a
`]} qwe"
  >
  <div on:click on:bind> {a} {@debug b} {@html '@debug qwe'} {a < 32 }</div>
</Component>