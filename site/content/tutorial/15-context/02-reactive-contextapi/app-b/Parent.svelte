<script>
	import { setContext } from 'svelte'
	import { writable } from 'svelte/store'

	let count = writable(0)
	setContext('count', count)
</script>

<p>Parent's count is: {$count}</p>

<slot />
