<script>
	let flip = true;
	let arrIterable = {
    *[Symbol.iterator]() { 
		  flip = !flip;
		  if (!flip) {
        yield [{ key: 'hello' }, { value: 1 }];
        yield [{ key: 'goodbye' }, { value: 2 }];
		  } else {
        yield [{ key: 'olleh' }, { value: -1 }];
        yield [{ key: 'eybdoog' }, { value: -2 }];
		  }
    }
	};
	export let bindings = {};
</script>

<button
	on:click={() => {
		arrIterable = arrIterable;
	}}>Flip</button
>
{#each arrIterable as [key, value]}
	<p bind:this={bindings[key.key]}>{value.value}</p>
{/each}
