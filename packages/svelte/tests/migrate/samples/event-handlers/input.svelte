<button on:click={() => console.log('hi')} on:click>click me</button>
<button on:click={() => console.log('before')} on:click on:click={() => console.log('after')}>click me</button>
<button on:click on:click={foo}>click me</button>
<button on:click>click me</button>

<button on:dblclick={() => console.log('hi')}>click me</button>
<button on:toggle>click me</button>
<button on:custom-event={() => 'hi'}>click me</button>
<button on:custom-event-bubble>click me</button>

<button on:click|preventDefault={() => ''}>click me</button>
<button on:click|stopPropagation={() => {}}>click me</button>
<button on:click|stopImmediatePropagation={() => ''}>click me</button>
<button on:click|capture={() => ''}>click me</button>
<button on:click|self={() => ''}>click me</button>

<Button on:click={() => 'leave untouched'} on:click>click me</Button>
