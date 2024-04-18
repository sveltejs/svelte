<!-- VALID -->
<div role="presentation" on:mouseup={() => {}}></div>
<div role="button" tabindex="-1" on:click={() => {}} on:keypress={() => {}}></div>
<div role="listitem" aria-hidden on:click={() => {}} on:keypress={() => {}}></div>
<button on:click={() => {}}></button>
<h1 contenteditable="true" on:keydown={() => {}}>Heading</h1>
<h1>Heading</h1>

<!-- INVALID -->
<div role="listitem" on:mousedown={() => {}}></div>
<h1 on:click={() => {}} on:keydown={() => {}}>Heading</h1>
<h1 role="banner" on:keyup={() => {}}>Heading</h1>
<p on:keypress={() => {}}></p>
<div role="paragraph" on:mouseup={() => {}}></div>
