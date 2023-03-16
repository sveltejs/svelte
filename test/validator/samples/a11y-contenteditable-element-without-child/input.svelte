<script>
	let text = 'Hello world';
</script>
<p bind:textContent={text} contenteditable="true"></p>
<p bind:innerHTML={text} contenteditable="true"></p>
<p bind:innerHTML={text}></p>
