<script>
	export let component;
</script>

<h1>Hello {component.name}!</h1>
<input bind:value={component.name}/>