<script>
	import { setContext } from 'svelte'
	import Child from './Child.svelte'
	setContext("key", 10)
</script>

<Child />

