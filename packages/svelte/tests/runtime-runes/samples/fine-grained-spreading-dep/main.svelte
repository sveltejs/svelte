<script lang="ts">
	import Test from "./Test.svelte";
	let rest = $state({});
</script>
  
<button id="no-keys-change" onclick={()=>{
rest = {};
}}></button>

<button id="keys-change" onclick={()=>{
	rest = { foo: 1 };
}}></button>

<button id="no-keys-change-assign" onclick={()=>{
	rest.foo = 1;
}}></button>

<button id="keys-change-assign" onclick={()=>{
	rest.bar = 1;
}}></button>

<button id="keys-change-override" onclick={()=>{
	rest = {about: "else"};
}}></button>

<button id="change-override-assign" onclick={()=>{
	rest.about = "another";
}}></button>


<Test about="something" {...rest}></Test>