<script>
	function renderContent(node) {
		node.textContent = 'foo';
	}
 
	const test = await Promise.resolve('foo');
</script>

<p>{test}</p>
<div {@attach renderContent}></div>
