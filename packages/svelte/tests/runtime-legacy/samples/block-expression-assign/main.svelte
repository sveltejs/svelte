<script>
    let a = 0, b = 0, c = 0, d = 0, e = 0, f = 0, g = 0, h = 0, i = 0;
    function inc() {
        a++;
        b++;
        c++;
        d++;
        e++;
        f++;
        g++;
        h++;
        i++;
    }
</script>

{#if a = 0}{/if}

{#each [b = 0] as x}{x,''}{/each}

{#key c = 0}{/key}

{#await d = 0}{/await}

{#snippet snip()}{/snippet}

{@render (e = 0, snip)()}

{@html f = 0, ''}

<div {@attach !!(g = 0)}></div>

{#key 1}
    {@const x = (h = 0)}
    {x, ''}
{/key}

{#if 1}
    {@const x = (i = 0)}
    {x, ''}
{/if}

<button on:click={inc}>inc</button>
[{a},{b},{c},{d},{e},{f},{g},{h},{i}]


