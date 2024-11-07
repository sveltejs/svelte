<script>
	import { writable } from 'svelte/store'
	import Test from './Test.svelte'
	let counter = 1
	let store = writable(counter)
</script>

<button on:click={() => store = writable(++counter)}></button>
<Test {store} />