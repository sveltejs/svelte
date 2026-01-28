<script>
	import { writable } from 'svelte/store';

	let style = writable('world');
	
	$effect(() => {
	  console.log($style);
	});

	function init(){
		style = writable('svelte');
	}
</script>
