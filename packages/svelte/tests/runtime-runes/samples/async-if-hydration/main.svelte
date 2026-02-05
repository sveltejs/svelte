<script lang="ts">
    const data = $derived(
        await Promise.resolve({
            a: true,
            b: false,
        }),
    );
</script>

<main>
    {#if data.a}
        <div>
            <h1>Title</h1>
            {#if data.b}
                <p>Text</p>
            {/if}

            <div>
                <button> Button </button>
            </div>
        </div>
    {/if}
</main>