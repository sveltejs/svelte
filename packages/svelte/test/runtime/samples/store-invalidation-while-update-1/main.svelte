<script>
	import {writable} from 'svelte/store';

	function action(node, binding) {
		return {
			update: (value) => s.set(value),
		}    
	}
	let s = writable("simple");
	let v = "";
	
	function click() {
		s.set('clicked');
	}
</script>

<input bind:value={v} use:action={v}>
<div>{v}</div>
<div>{$s}</div>
<button on:click={click}>click me</button>
