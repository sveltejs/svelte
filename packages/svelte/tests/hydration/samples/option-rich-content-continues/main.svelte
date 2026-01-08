<script>
	import Inner from './Inner.svelte';

	let label = $state('hello');
</script>

<select>
	<!-- this would fail during hydration if rich_option handling is not correct -->
	<option value="a"><Inner {label} /></option>
	<option value="b">Plain text</option>
</select>
	
<button onclick={() => label = "changed"}></button>
