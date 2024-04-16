<script>
    let items = $state([{a: 0}]);
</script>

<button on:click={() => items.push({a: items.length})}>{JSON.stringify(structuredClone($state.snapshot(items)))}</button>
