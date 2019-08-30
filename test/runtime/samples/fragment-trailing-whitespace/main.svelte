<script>
    let message = "the quick brown fox jumps over the lazy dog"
</script>

<div id="first">
    {#each message as char}
        <span>{char} </span>
    {/each}
</div>

<div id="second">{#each message as char}<span>{char} </span>{/each}</div>