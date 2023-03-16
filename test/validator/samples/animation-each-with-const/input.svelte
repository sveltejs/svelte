<script>
  function flip(){}
</script>

<div>
  {#each [] as n (n)}
    {@const a = n}
    <div animate:flip={a} />
  {/each}
</div>
