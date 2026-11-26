<script>
	let content = $state("");
</script>

<div id="editable" onblur={(e) => { content = e.currentTarget.textContent; }} contenteditable="true">
	{@html content}
</div>

<p id="output">{content}</p>
