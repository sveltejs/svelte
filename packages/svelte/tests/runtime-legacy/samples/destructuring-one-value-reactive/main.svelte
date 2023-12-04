<script> 
    import { writable } from 'svelte/store';

	let { foo, toggleFoo } = (() => {
		const foo = writable(false);
		return { foo, toggleFoo: () => foo.update(f => !f) }
	})();
</script>

<button on:click={toggleFoo}>{$foo}</button>
<button on:click={() => foo = null}>click handler marks foo as reactive</button>
