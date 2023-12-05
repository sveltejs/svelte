<script>
		import { unstate } from 'svelte';

    let items = $state([{a: 0}]);
</script>

<button on:click={() => items.push({a: items.length})}>{JSON.stringify(structuredClone(unstate(items)))}</button>
