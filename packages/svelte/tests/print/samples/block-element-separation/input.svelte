<svelte:head><title>Page Title</title></svelte:head><div>no space</div>
<Component /><Component />
<Component><span>child</span></Component><div>after component</div>
<svelte:boundary><div>boundary content</div></svelte:boundary><div>after boundary</div>
<!--comment--><div>after comment</div>
<div>before comment</div><!--comment-->
{#each items as item}<div>{item}</div>{/each}<div>after each</div>
{@render children()}<div>after render</div>
<div>before render</div>{@render children()}

<Component />   <div>with spaces</div>
<Component><span>child</span></Component>   <div>spaces after component</div>
<!--comment-->   <div>spaces after comment</div>
{@render children()}   <div>spaces after render</div>

<Component />
<div>newline between</div>
<!--comment-->
<div>newline after comment</div>
{#each items as item}
<div>{item}</div>
{/each}
<div>newline after each</div>
{@render children()}
<div>after render</div>
