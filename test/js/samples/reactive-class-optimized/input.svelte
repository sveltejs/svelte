<script context="module">
	let nonReactiveModuleVar = Math.random();
	let reactiveModuleVar = Math.random();
</script>

<script>
	import { reactiveStoreVal, unreactiveExport } from './store';

	nonReactiveGlobal = Math.random();
	const reactiveConst = {x: Math.random()};

	$: reactiveDeclaration = reactiveModuleVar * 2;

	reactiveModuleVar += 1;
	if (Math.random()) {
		reactiveConst.x += 1;
	}
</script>

<!--These should all get updaters because they have at least one reactive dependency-->
<div class:update1={reactiveModuleVar}></div>
<div class:update2={reactiveConst.x}></div>
<div class:update3={nonReactiveGlobal && reactiveConst.x}></div>
<div class:update4={$reactiveStoreVal}></div>
<div class:update5={$reactiveDeclaration}></div>

<!--These shouldn't get updates because they're purely non-reactive-->
<div class:static1={nonReactiveModuleVar}></div>
<div class:static2={nonReactiveGlobal}></div>
<div class:static3={nonReactiveModuleVar && nonReactiveGlobal}></div>
<div class:static4={unreactiveExport}></div>
