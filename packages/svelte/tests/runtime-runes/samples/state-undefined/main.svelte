<script>
    let foo = $state();
</script>

<button on:click={() => foo = 'foo'}>{foo}</button>
