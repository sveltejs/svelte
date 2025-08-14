<script>
	let obj = { count: 0 };

	let a = $state(obj, {
	  onchange() {
	    console.log('a');
	  }
	});
	
	let b = $state(obj, {
	  onchange() {
	    console.log('b');
	  }
	});
	
	let c = $state(b, {
	  onchange() {
	    console.log('c');
	  }
	});
</script>

<button onclick={()=> a.count++}>{a.count}</button>
<button onclick={()=> b.count++}>{b.count}</button> 
<button onclick={()=> c.count++}>{c.count}</button> 

<button onclick={() => c = { count: c.count }}>unlink</button> 