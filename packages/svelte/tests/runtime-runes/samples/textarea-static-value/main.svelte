<script>
	let dynamic = $state('hi');
</script>

<!-- static attribute value must populate the textarea on CSR (#18574) -->
<textarea id="static-attr" value="hi"></textarea>
<textarea id="static-expr" value={'hi'}></textarea>
<textarea id="dynamic" value={dynamic}></textarea>
<textarea id="children">hi</textarea>
<textarea id="leading-nl" value={"\nhi"}></textarea>
<textarea id="escaped" value={'a<b&c'}></textarea>
