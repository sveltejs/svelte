<script>
    let name = $state('world');
    /**
     * @template T
     * @param {T} value
     * @param {number} ms
     * @returns {Promise<T>}
     */
    function wait(value, ms) {
        return new Promise(resolve => setTimeout(resolve, ms, value));
    }
</script>
<svelte:boundary>
    {#snippet pending()}
        <h1>Loading...</h1>
    {/snippet}
    {#snippet greet()}
        {@const greeting = await wait(`Hello, ${name}!`, 50)}
        <h1>{greeting}</h1>
        <input type="text" bind:value={name} />
    {/snippet}
    {@render greet()}
</svelte:boundary>