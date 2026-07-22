<script>
	let {
		prop1 = undefined
	} = $props()
	
	let received_wrong_prop = false
	if (typeof prop1 !== 'string') {
		received_wrong_prop = true
	}
	$inspect("Comp1 received_wrong_prop", received_wrong_prop)
	$inspect("Comp1 prop1", prop1)
</script>
<div data-received-wrong-prop={received_wrong_prop}>Comp1: {prop1}</div>
