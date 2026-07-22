<script>
	let {
		prop2 = undefined
	} = $props()
	
	let received_wrong_prop = false
	if (typeof prop2 !== 'string') {
		received_wrong_prop = true
	}
	$inspect("Comp2 received_wrong_prop", received_wrong_prop)
	$inspect("Comp2 prop2", prop2)
</script>
<div data-received-wrong-prop={received_wrong_prop}>Comp2: {prop2}</div>
