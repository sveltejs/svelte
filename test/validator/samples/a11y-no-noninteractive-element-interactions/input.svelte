<!-- VALID -->
<div role="presentation" on:mouseup={() => {}} />
<div role="button" tabindex="-1" on:click={() => {}} on:keypress={() => {}} />
<div role="listitem" aria-hidden on:click={() => {}} on:keypress={() => {}} />
<button on:click={() => {}} />
<h1 contenteditable="true" on:keydown={() => {}}>Heading</h1>
<h1>Heading</h1>

<!-- INVALID -->
<div role="listitem" on:mousedown={() => {}} />
<h1 on:click={() => {}} on:keydown={() => {}}>Heading</h1>
<h1 role="banner" on:keyup={() => {}}>Heading</h1>
<p on:keypress={() => {}} />
<div role="paragraph" on:mouseup={() => {}} />
