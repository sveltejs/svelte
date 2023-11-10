<script>
	const {log} = $props();

	let myList = $state([{ name: 'one' ,age: 4 }, {name: 'two', age: 5}]);

	let myDerived = $derived(myList)

	$effect(() => {
		myList
		log.push('A')
	})

	$effect(() => {
		myDerived		
		log.push('B')
	})
</script>

<h1>Hello {myList[0].age}</h1>

<button on:click={() => myList[0].age++ }>Click</button>
