<script>
	import { writable } from "svelte/store";

	let text = writable('foo');
	let wrapped = writable({});
	$effect(() => { $wrapped.contents = $text; })
</script>

<input bind:value={$text} />
<input bind:value={$wrapped.contents} />
<p>text: {$text}</p>
<p>wrapped.contents: {$wrapped.contents}</p> 
