<script>
    import App from './app.svelte';
</script>
<svelte:boundary>
    {#snippet pending()}
    {/snippet}
    <App />
</svelte:boundary>