<script>
	export let retained;
	export let removed;
</script>

<form data-case="retained" {...retained}><input name="namespaceURI" /></form>
<form data-case="removed" {...removed}><input name="namespaceURI" /></form>
<form data-case="local-name" {...removed}><input name="localName" /></form>
