<script>
    let count1 = 1;
    let count2 = 1;
    function fn(ret) {
        if (count1 > 100) return ret;
        count1++;
        count2++;
        return ret;
    }

    const obj = {
        get true() { return fn(true) },
        get false() { return fn(false) },
        get array() { return fn([]) },
        get string() { return fn('') },
        get promise() { return fn(Promise.resolve()) },
        get snippet() { return fn(snip) },
        get attachment() { return fn(() => {}) },
    }
</script>

{#if obj.false}{:else if obj.true}{/if}

{#each obj.array as x}{x, ''}{/each}

{#key obj.string}{/key}

{#await obj.promise}{/await}

{#snippet snip()}{/snippet}

{@render obj.snippet()}

{@html obj.string}

<div {@attach obj.attachment}></div>

{#key 1}
    {@const x = obj.string}
    {x}
{/key}

<button on:click={() => count1++}>inc</button>
{count1} - {count2}


