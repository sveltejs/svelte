<script>
	let text = $state('foo');
	let wrapped = $state({});
	$effect(() => { wrapped.contents = text; })
</script>

<input bind:value={text} />
<input bind:value={wrapped.contents} />
<p>text: {text}</p>
<p>wrapped.contents: {wrapped.contents}</p> 
