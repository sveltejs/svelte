<script>
	import Parent from './Parent.svelte';
</script>

<Parent>
	<h3 slot="first">First slot</h3>
</Parent>
<Parent>
	<h4 slot="second">Second slot</h4> 
</Parent>
<Parent>
	<h3>Default slot</h3>
</Parent>
