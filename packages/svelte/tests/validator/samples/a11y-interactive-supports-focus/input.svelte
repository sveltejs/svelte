<!-- VALID -->
<div aria-hidden="true" role="button" on:keypress={() => {}}></div>
<div aria-disabled="true" role="button" on:keypress={() => {}}></div>
<div disabled role="button" on:keypress={() => {}}></div>
<div role="presentation" on:keypress={() => {}}></div>
<button on:click={() => {}}>click me</button>
<div role="menuitem" tabindex="0" on:click={() => {}} on:keypress={() => {}}></div>
<div role="button" tabindex="-1" on:click={() => {}} on:keypress={() => {}}></div>

<!-- INVALID -->
<div role="button" on:keypress={() => {}}></div>
<span role="menuitem" on:keydown={() => {}}></span>
<div role="button" on:keyup={() => {}}></div>
<span role="menuitem" on:click={() => {}} on:keypress={() => {}}></span>
<div role="button" on:contextmenu={() => {}}></div>
<span role="menuitem" on:dblclick={() => {}}></span>
<div role="button" on:drag={() => {}}></div>
<span role="menuitem" on:dragend={() => {}}></span>
<div role="button" on:dragenter={() => {}}></div>
<span role="menuitem" on:dragexit={() => {}}></span>
<div role="button" on:dragleave={() => {}}></div>
<span role="menuitem" on:dragover={() => {}}></span>
<div role="button" on:dragstart={() => {}}></div>
<span role="menuitem" on:drop={() => {}}></span>
<div role="button" on:mousedown={() => {}}></div>
<span role="menuitem" on:mouseenter={() => {}}></span>
<div role="button" on:mouseleave={() => {}}></div>
<span role="menuitem" on:mousemove={() => {}}></span>
<div role="button" on:mouseout={() => {}}></div>
<span role="menuitem" on:mouseover={() => {}}></span>
<div role="button" on:mouseup={() => {}}></div>

