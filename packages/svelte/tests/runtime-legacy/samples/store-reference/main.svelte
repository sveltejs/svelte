<script>
	import {writable} from 'svelte/store'
	let store = writable(0)
</script>

<button onclick={() => {
	if(store && $store){

	}
}}>
	clicks: {$store}
</button>
