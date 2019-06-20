<script>
    let message = "the quick brown fox jumps over the lazy dog"
</script>

<div>
    {#each message as char}
        <span>{char} </span>
    {/each}
</div>

<div>
    {#each message as char}
        <span>{char} </span>
    {/each}
</div>