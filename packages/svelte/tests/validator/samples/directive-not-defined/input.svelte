<div transition:nonexistent>cool</div>

<div in:nonexistent>cool</div>

<div out:nonexistent>cool</div>

<div out:nonexistent|global>cool</div>

<div in:nonexistent|global>cool</div>

<div transition:nonexistent|global>cool</div>

{#if false}
	<div use:nonexistent>cool</div>
{/if}

{#each [] as i (i)}
	<div animate:nonexistent></div>
{/each}

<div style:color={nonexistent}></div>

<div style:color></div>

<div class:someclass={nonexistent}></div>

<div class:nonexistent></div>