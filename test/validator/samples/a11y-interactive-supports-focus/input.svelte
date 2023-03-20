<!-- VALID -->
<div aria-hidden role="button" on:keypress={() => {}} />
<div aria-disabled role="button" on:keypress={() => {}} />
<div disabled role="button" on:keypress={() => {}} />
<div role="presentation" on:keypress={() => {}} />
<button on:click={() => {}} />
<div role="menuitem" tabindex="0" on:click={() => {}} on:keypress={() => {}} />
<div role="button" tabindex="-1" on:click={() => {}} on:keypress={() => {}} />

<!-- INVALID -->
<div role="button" on:keypress={() => {}} />
<span role="menuitem" on:keydown={() => {}} />
<div role="button" on:keyup={() => {}} />
<span role="menuitem" on:click={() => {}} on:keypress={() => {}} />
<div role="button" on:contextmenu={() => {}} />
<span role="menuitem" on:dblclick={() => {}} />
<div role="button" on:drag={() => {}} />
<span role="menuitem" on:dragend={() => {}} />
<div role="button" on:dragenter={() => {}} />
<span role="menuitem" on:dragexit={() => {}} />
<div role="button" on:dragleave={() => {}} />
<span role="menuitem" on:dragover={() => {}} />
<div role="button" on:dragstart={() => {}} />
<span role="menuitem" on:drop={() => {}} />
<div role="button" on:mousedown={() => {}} />
<span role="menuitem" on:mouseenter={() => {}} />
<div role="button" on:mouseleave={() => {}} />
<span role="menuitem" on:mousemove={() => {}} />
<div role="button" on:mouseout={() => {}} />
<span role="menuitem" on:mouseover={() => {}} />
<div role="button" on:mouseup={() => {}} />

