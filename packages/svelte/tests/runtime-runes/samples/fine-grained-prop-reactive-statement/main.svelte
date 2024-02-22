<script>
	import Old from './old.svelte';

	let prop = $state({ count: 0 });
</script>

<button onclick={() => prop = {...prop, count: prop.count + 1 }}>reassign</button>
<button onclick={() => prop.count++}>mutate</button>
<Old {prop}></Old>
