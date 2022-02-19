<script>
	import { setContext } from 'svelte'

	let count = 0
	setContext('count', count)
</script>

<p>Parent's count is: {count}</p>

<slot />
