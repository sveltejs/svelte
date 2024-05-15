<mrow></mrow>

{#if true}
  <mrow></mrow>
{/if}

{#each Array(2).fill(0) as item, idx}
  <mrow></mrow>
{/each}

{@html '<mrow></mrow>'}

{@render test()}

{#snippet test(text)}
<mrow></mrow>
{/snippet}

<!-- comment should not infer html namespace -->
