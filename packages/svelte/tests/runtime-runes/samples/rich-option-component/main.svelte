<script>
	import Content from './Content.svelte';

	let content = $state('b');
</script>


<!-- Test 2: Option with component as content -->
<select>
	<option value="x"><span>{content}</span><Content text={content} /></option>
</select>

<button onclick={() => content = content === 'a' ? 'b' : 'a'}>
	Toggle Content
</button>