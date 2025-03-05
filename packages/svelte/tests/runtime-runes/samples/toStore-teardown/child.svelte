<script>
	import { toStore } from 'svelte/store'

	let { data } = $props()
	const currentValue = toStore(() => data.value)
</script>

<p>
	Current value:
	<span>{$currentValue}</span>
</p>
