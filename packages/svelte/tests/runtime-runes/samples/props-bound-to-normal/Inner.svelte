<script>
    let { bar } = $props();
</script>

<button on:click={() => bar--}>{bar}</button>