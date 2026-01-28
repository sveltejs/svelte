<script>
	let list = $state()
	let count = $state(0);

	function increment() {
		count += 1;
	}
</script>

<button onclick={increment}>clicks: {count}</button>
<button onclick={()=>list=undefined}>undefined</button>
<button onclick={()=>list=null}>null</button>
<button onclick={()=>list=[]}>empty</button>
<button onclick={()=>list=[1,2,3]}>[1,2,3]</button>

<ul>
{#each list as a}
	<li>item : {a}</li>
{:else}
	<li>count = <span>{count}</span></li>
{/each}
</ul>