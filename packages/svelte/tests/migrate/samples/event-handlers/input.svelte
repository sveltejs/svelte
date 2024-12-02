<button on:click={() => console.log('hi')} on:click>click me</button>
<button on:click={function(){ console.log('hi') }} on:click>click me</button>
<button on:click={() => console.log('before')} on:click on:click={() => console.log('after')}
	>click me</button
>
<button on:click on:click={foo}>click me</button>
<button on:click>click me</button>

<button on:dblclick={() => console.log('hi')}>click me</button>
<button on:toggle>click me</button>
<button on:custom-event={() => 'hi'}>click me</button>
<button on:custom-event-bubble>click me</button>

<button on:click|preventDefault={() => (searching = true)}>click me</button>
<button on:click|preventDefault={() => ''}>click me</button>
<button on:click|stopPropagation={() => {}}>click me</button>
<button on:click|stopImmediatePropagation={() => ''}>click me</button>
<button on:click|capture={() => ''}>click me</button>
<button on:click|self={() => ''}>click me</button>
<button on:click|trusted={() => ''}>click me</button>
<button on:click|once={() => ''}>click me</button>

<button on:click|preventDefault|stopPropagation={() => ''}>click me</button>
<button on:click|stopPropagation|stopImmediatePropagation={() => {}}>click me</button>
<button on:click|stopImmediatePropagation|self={() => ''}>click me</button>
<button on:click|self|trusted={() => ''}>click me</button>
<button on:click|trusted|self={() => ''}>click me</button>
<button on:click|trusted|once={() => ''}>click me</button>
<button on:click|once|preventDefault={() => ''}>click me</button>

<button on:click|passive>click me</button>
<button on:click|nonpassive>click me</button>
<button on:click|passive={()=>''}>click me</button>
<button on:click|nonpassive={()=>''}>click me</button>
<button on:click|passive={foo}>click me</button>
<button on:click|nonpassive={foo}>click me</button>
<button on:click|stopPropagation|passive={()=>''}>click me</button>
<button on:click|trusted|nonpassive={()=>''}>click me</button>

<button
	on:click|passive={()=>''}
	on:click
	on:click={()=>''}
>click me</button>

<button
	on:click|nonpassive={()=>''}
	on:click
	on:click={()=>{
		return 'multiline';
	}}
>click me</button>


<button
	on:click
	on:click={foo}
	on:blur={foo}
	on:click={()=>''}
	on:click|trusted|preventDefault|once={()=>''}
	on:blur|trusted|preventDefault|once
>
	click me
</button>


<Button on:click={() => 'leave untouched'} on:click>click me</Button>

<div>
	<button
		on:click={() => {
			console.log('hi');
		}}>click me</button
	>
	<button
		on:click|preventDefault={() => {
			console.log('hi');
		}}>click me</button
	>
	<button on:click|preventDefault={() => (count += 1)}>click me</button>
</div>
