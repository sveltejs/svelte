<script>
	import { writable } from 'svelte/store';
	let foo = writable(0);
</script>

<h1>{$foo}</h1>
<button on:click="{() => foo.update(n => n + 1)}">+1</button>
<button on:click="{() => foo = writable(0)}">reset</button>