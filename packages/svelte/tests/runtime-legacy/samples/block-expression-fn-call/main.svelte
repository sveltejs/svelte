<script>
    let count1 = 1;
    let count2 = 1;
    function fn(ret) {
        if (count1 > 100) return ret;
        count1++;
        count2++;
        return ret;
    }
</script>

{#if fn(false)}{:else if fn(true)}{/if}

{#each fn([]) as x}{x, ''}{/each}

{#key fn(1)}{/key}

{#await fn(Promise.resolve())}{/await}

{#snippet snip()}{/snippet}

{@render fn(snip)()}

{@html fn('')}

<div {@attach fn(() => {})}></div>

{#key 1}
    {@const x = fn('')}
    {x}
{/key}

<button data-foo={fn(true)} on:click={() => count1++}>{fn('inc')}</button>
{count1} - {count2}


