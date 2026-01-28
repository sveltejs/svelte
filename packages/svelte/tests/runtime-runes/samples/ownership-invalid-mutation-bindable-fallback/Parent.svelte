<script>
	let { test = $bindable({}) } = $props();
</script>

<button onclick={()=>test = {}}></button>
<button onclick={()=>test.test = {}}></button>

{test}