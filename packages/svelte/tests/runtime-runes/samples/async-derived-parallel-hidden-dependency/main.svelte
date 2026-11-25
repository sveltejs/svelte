<script lang="ts">
	import Store from './Store.svelte';
	import Member from './Member.svelte';
	import Default from './Default.svelte';
	import ArrayDefault from './ArrayDefault.svelte';
	import Class from './Class.svelte';
	import ShadowedEffect from './ShadowedEffect.svelte';
	import FunctionDerived from './FunctionDerived.svelte';
	import NamedFunction from './NamedFunction.svelte';
	import Coercion from './Coercion.svelte';
	import DefaultParameterAlias from './DefaultParameterAlias.svelte';
	import ExternalAlias from './ExternalAlias.svelte';
	import EscapedPrimitive from './EscapedPrimitive.svelte';
	import EscapedStore from './EscapedStore.svelte';
	import EscapedNamedFunction from './EscapedNamedFunction.svelte';
	import EscapedConstructor from './EscapedConstructor.svelte';
	import EscapedTaggedTemplate from './EscapedTaggedTemplate.svelte';
	import ForIn from './ForIn.svelte';
	import ForOf from './ForOf.svelte';
	import FunctionAlias from './FunctionAlias.svelte';
	import GetterRead from './GetterRead.svelte';
	import GetterWrite from './GetterWrite.svelte';
	import ModuleReassignment from './ModuleReassignment.svelte';
	import OpaqueArguments from './OpaqueArguments.svelte';
	import Opaque from './Opaque.svelte';
	import PropertyAlias from './PropertyAlias.svelte';
	import PureGaps from './PureGaps.svelte';
	import TaggedTemplate from './TaggedTemplate.svelte';
	import IndependentPropertyRead from './IndependentPropertyRead.svelte';
	import IndependentStringMethod from './IndependentStringMethod.svelte';
	import IndependentNestedAlias from './IndependentNestedAlias.svelte';
	import IndependentDefaultHelper from './IndependentDefaultHelper.svelte';
	import DependentGetterRead from './DependentGetterRead.svelte';
	import DependentOptionsRead from './DependentOptionsRead.svelte';
	import PropertyWriteBarrier from './PropertyWriteBarrier.svelte';
	import DefaultFunctionAlias from './DefaultFunctionAlias.svelte';
	import LoopFunctionAlias from './LoopFunctionAlias.svelte';
	import ThrownFunctionAlias from './ThrownFunctionAlias.svelte';
	import VarFunctionAlias from './VarFunctionAlias.svelte';
	import PlainPropertyGap from './PlainPropertyGap.svelte';
	import PrimitiveParameterGap from './PrimitiveParameterGap.svelte';
	import UnusedCallbackGap from './UnusedCallbackGap.svelte';
	import StringMethodGap from './StringMethodGap.svelte';
	import LocalAccessorGap from './LocalAccessorGap.svelte';
	import ObjectReturnGap from './ObjectReturnGap.svelte';
	import CallbackWriteGap from './CallbackWriteGap.svelte';
	import ReceiverMutationGap from './ReceiverMutationGap.svelte';
	import MixedCoercionCalls from './MixedCoercionCalls.svelte';
	import ThenableGap from './ThenableGap.svelte';
	import AsyncThenableGap from './AsyncThenableGap.svelte';
	import ExternalGetterGap from './ExternalGetterGap.svelte';
	import OpaqueArgumentBarrier from './OpaqueArgumentBarrier.svelte';
	import LoopGap from './LoopGap.svelte';
	import ObjectAssign from './ObjectAssign.svelte';
	import ImportedMethodBarrier from './ImportedMethodBarrier.svelte';
	import DestructuredGetter from './DestructuredGetter.svelte';
	import StoredCallback from './StoredCallback.svelte';
	import ImportedRegistry from './ImportedRegistry.svelte';
	import ClassStaticBlock from './ClassStaticBlock.svelte';
</script>

<!-- Keep each dependency graph in its own component so one conservative barrier cannot mask another case. -->
<section data-case="store"><Store /></section>
<section data-case="member"><Member /></section>
<section data-case="default"><Default /></section>
<section data-case="array-default"><ArrayDefault /></section>
<section data-case="class"><Class /></section>
<section data-case="shadowed-effect"><ShadowedEffect /></section>
<section data-case="function-derived"><FunctionDerived /></section>
<section data-case="named-function"><NamedFunction /></section>
<section data-case="coercion"><Coercion /></section>
<section data-case="default-parameter-alias"><DefaultParameterAlias /></section>
<section data-case="external-alias"><ExternalAlias /></section>
<section data-case="escaped-primitive"><EscapedPrimitive /></section>
<section data-case="escaped-store"><EscapedStore /></section>
<section data-case="escaped-named-function"><EscapedNamedFunction /></section>
<section data-case="escaped-constructor"><EscapedConstructor /></section>
<section data-case="escaped-tagged-template"><EscapedTaggedTemplate /></section>
<section data-case="for-in"><ForIn /></section>
<section data-case="for-of"><ForOf /></section>
<section data-case="function-alias"><FunctionAlias /></section>
<section data-case="getter-read"><GetterRead /></section>
<section data-case="getter-write"><GetterWrite /></section>
<section data-case="module-reassignment"><ModuleReassignment /></section>
<section data-case="opaque-arguments"><OpaqueArguments /></section>
<section data-case="opaque"><Opaque /></section>
<section data-case="property-alias"><PropertyAlias /></section>
<section data-case="pure-gaps"><PureGaps /></section>
<section data-case="tagged-template"><TaggedTemplate /></section>
<section data-case="property-read"><IndependentPropertyRead /></section>
<section data-case="string-method"><IndependentStringMethod /></section>
<section data-case="nested-alias"><IndependentNestedAlias /></section>
<section data-case="default-helper"><IndependentDefaultHelper /></section>
<section data-case="dependent-getter"><DependentGetterRead /></section>
<section data-case="dependent-options"><DependentOptionsRead /></section>
<section data-case="property-write"><PropertyWriteBarrier /></section>
<section data-case="default-function-alias"><DefaultFunctionAlias /></section>
<section data-case="loop-function-alias"><LoopFunctionAlias /></section>
<section data-case="thrown-function-alias"><ThrownFunctionAlias /></section>
<section data-case="var-function-alias"><VarFunctionAlias /></section>
<section data-case="plain-property-gap"><PlainPropertyGap /></section>
<section data-case="primitive-parameter-gap"><PrimitiveParameterGap /></section>
<section data-case="unused-callback-gap"><UnusedCallbackGap /></section>
<section data-case="string-method-gap"><StringMethodGap /></section>
<section data-case="local-accessor-gap"><LocalAccessorGap /></section>
<section data-case="object-return-gap"><ObjectReturnGap /></section>
<section data-case="callback-write-gap"><CallbackWriteGap /></section>
<section data-case="receiver-mutation-gap"><ReceiverMutationGap /></section>
<section data-case="mixed-coercion-calls"><MixedCoercionCalls /></section>
<section data-case="thenable-gap"><ThenableGap /></section>
<section data-case="async-thenable-gap"><AsyncThenableGap /></section>
<section data-case="external-getter-gap"><ExternalGetterGap /></section>
<section data-case="opaque-argument-barrier"><OpaqueArgumentBarrier /></section>
<section data-case="loop-gap"><LoopGap /></section>
<section data-case="object-assign"><ObjectAssign /></section>
<section data-case="imported-method-barrier"><ImportedMethodBarrier /></section>
<section data-case="destructured-getter"><DestructuredGetter /></section>
<section data-case="stored-callback"><StoredCallback /></section>
<section data-case="imported-registry"><ImportedRegistry /></section>
<section data-case="class-static-block"><ClassStaticBlock /></section>
