<script>
	import Child2 from './Child2.svelte'
	import Child from './Child.svelte'
	let loginname = $state('')
	let password = $state('')
</script>

<Child bind:value={loginname} />
<Child bind:value={password} />
<Child2 disabled={!loginname || !password} />

