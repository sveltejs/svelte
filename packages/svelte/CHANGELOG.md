# svelte

## 5.0.0-next.81

### Patch Changes

- feat: add support for webkitdirectory DOM boolean attribute ([#10847](https://github.com/sveltejs/svelte/pull/10847))

- fix: don't override instance methods during legacy class creation ([#10834](https://github.com/sveltejs/svelte/pull/10834))

- fix: adjust scope parent for named slots ([#10843](https://github.com/sveltejs/svelte/pull/10843))

- fix: improve handling of unowned derived signals ([#10842](https://github.com/sveltejs/svelte/pull/10842))

- fix: improve element class attribute behaviour ([#10856](https://github.com/sveltejs/svelte/pull/10856))

- fix: ensure select value is updated upon select option removal ([#10846](https://github.com/sveltejs/svelte/pull/10846))

- fix: ensure capture events don't call delegated events ([#10831](https://github.com/sveltejs/svelte/pull/10831))

## 5.0.0-next.80

### Patch Changes

- fix: add types for svelte/reactivity ([#10817](https://github.com/sveltejs/svelte/pull/10817))

- fix: ensure arguments are supported on all reactive Date methods ([#10813](https://github.com/sveltejs/svelte/pull/10813))

## 5.0.0-next.79

### Patch Changes

- feat: add reactive Map class to svelte/reactivity ([#10803](https://github.com/sveltejs/svelte/pull/10803))

## 5.0.0-next.78

### Patch Changes

- fix: invalidate store when mutated inside each block ([#10785](https://github.com/sveltejs/svelte/pull/10785))

- fix: make `set.has(...)` granular for existing properties' ([#10793](https://github.com/sveltejs/svelte/pull/10793))

## 5.0.0-next.77

### Patch Changes

- fix: adjust render effect ordering ([#10783](https://github.com/sveltejs/svelte/pull/10783))

- fix: handle component binding mutation ([#10786](https://github.com/sveltejs/svelte/pull/10786))

## 5.0.0-next.76

### Patch Changes

- feat: add reactive Set class to svelte/reactivity ([#10781](https://github.com/sveltejs/svelte/pull/10781))

- breaking: make `$props()` rune non-generic ([#10694](https://github.com/sveltejs/svelte/pull/10694))

- fix: improve internal render effect sequencing ([#10769](https://github.com/sveltejs/svelte/pull/10769))

## 5.0.0-next.75

### Patch Changes

- fix: use getters for derived class state fields, with memoisation ([#10757](https://github.com/sveltejs/svelte/pull/10757))

## 5.0.0-next.74

### Patch Changes

- fix: prevent reactive statement reruns when they have indirect cyclic dependencies ([#10736](https://github.com/sveltejs/svelte/pull/10736))

## 5.0.0-next.73

### Patch Changes

- fix: improve bind:this support around proxyied state ([#10732](https://github.com/sveltejs/svelte/pull/10732))

- fix: bump specificity on all members of a selector list ([#10730](https://github.com/sveltejs/svelte/pull/10730))

- breaking: preserve slots inside templates with a shadowrootmode attribute ([#10721](https://github.com/sveltejs/svelte/pull/10721))

- chore: custom elements validation ([#10720](https://github.com/sveltejs/svelte/pull/10720))

- fix: ensure performance.now() and requestAnimationFrame() are polyfilled in ssr ([#10715](https://github.com/sveltejs/svelte/pull/10715))

- fix: eagerly unsubscribe when store is changed ([#10727](https://github.com/sveltejs/svelte/pull/10727))

- fix: error when exporting reassigned state from module context ([#10728](https://github.com/sveltejs/svelte/pull/10728))

## 5.0.0-next.72

### Patch Changes

- fix: adjust keyed each block equality handling ([#10699](https://github.com/sveltejs/svelte/pull/10699))

- fix: improve indexed each equality ([#10702](https://github.com/sveltejs/svelte/pull/10702))

- fix: prevent snippet children conflict ([#10700](https://github.com/sveltejs/svelte/pull/10700))

## 5.0.0-next.71

### Patch Changes

- fix: improve namespace inference when having `{@render}` and `{@html}` tags ([#10631](https://github.com/sveltejs/svelte/pull/10631))

- fix: don't collapse whitespace within text nodes ([#10691](https://github.com/sveltejs/svelte/pull/10691))

## 5.0.0-next.70

### Patch Changes

- fix: better ownership mutation validation ([#10673](https://github.com/sveltejs/svelte/pull/10673))

- fix: handle TypeScript's optional parameter syntax in snippets ([#10671](https://github.com/sveltejs/svelte/pull/10671))

- fix: deduplicate generated props and action arg names ([#10669](https://github.com/sveltejs/svelte/pull/10669))

## 5.0.0-next.69

### Patch Changes

- perf: bail early when traversing non-state ([#10654](https://github.com/sveltejs/svelte/pull/10654))

- feat: improve ssr html mismatch validation ([#10658](https://github.com/sveltejs/svelte/pull/10658))

- fix: improve ssr output of dynamic textarea elements ([#10638](https://github.com/sveltejs/svelte/pull/10638))

- fix: improve ssr code generation for class property $derived ([#10661](https://github.com/sveltejs/svelte/pull/10661))

- fix: warn when `$props` rune not called ([#10655](https://github.com/sveltejs/svelte/pull/10655))

- fix: improve derived rune destructuring support ([#10665](https://github.com/sveltejs/svelte/pull/10665))

- feat: allow arbitrary call expressions and optional chaining for snippets ([#10656](https://github.com/sveltejs/svelte/pull/10656))

- fix: add `$set` and `$on` methods in legacy compat mode ([#10642](https://github.com/sveltejs/svelte/pull/10642))

## 5.0.0-next.68

### Patch Changes

- fix: improve deep_read performance ([#10624](https://github.com/sveltejs/svelte/pull/10624))

## 5.0.0-next.67

### Patch Changes

- fix: improve event delegation with shadowed bindings ([#10620](https://github.com/sveltejs/svelte/pull/10620))

- feat: add reactive Date object to svelte/reactivity ([#10622](https://github.com/sveltejs/svelte/pull/10622))

## 5.0.0-next.66

### Patch Changes

- fix: don't clear date input on temporarily invalid value ([#10616](https://github.com/sveltejs/svelte/pull/10616))

- fix: use safe-equals comparison for `@const` tags in legacy mode ([#10606](https://github.com/sveltejs/svelte/pull/10606))

- fix: improve proxy effect dependency tracking ([#10605](https://github.com/sveltejs/svelte/pull/10605))

- fix: prevent window listeners from triggering events twice ([#10611](https://github.com/sveltejs/svelte/pull/10611))

- feat: allow dynamic `type` attribute with `bind:value` ([#10608](https://github.com/sveltejs/svelte/pull/10608))

- fix: make `bind_this` implementation more robust ([#10598](https://github.com/sveltejs/svelte/pull/10598))

- fix: tweak initial `bind:clientWidth/clientHeight/offsetWidth/offsetHeight` update timing ([#10512](https://github.com/sveltejs/svelte/pull/10512))

- fix: correctly handle proxied signal writes before reads ([#10612](https://github.com/sveltejs/svelte/pull/10612))

## 5.0.0-next.65

### Patch Changes

- fix: improve $inspect handling of derived objects ([#10584](https://github.com/sveltejs/svelte/pull/10584))

- fix: permit whitespace within template scripts ([#10591](https://github.com/sveltejs/svelte/pull/10591))

- fix: allow boolean `contenteditable` attribute ([#10590](https://github.com/sveltejs/svelte/pull/10590))

- fix: improve import event handler support ([#10592](https://github.com/sveltejs/svelte/pull/10592))

## 5.0.0-next.64

### Patch Changes

- fix: inherit ownerlessness when creating child proxies ([#10577](https://github.com/sveltejs/svelte/pull/10577))

## 5.0.0-next.63

### Patch Changes

- fix: handle member expressions in directives ([#10576](https://github.com/sveltejs/svelte/pull/10576))

- fix: remove memory leak ([#10570](https://github.com/sveltejs/svelte/pull/10570))

- fix: call beforeUpdate/afterUpdate callbacks when props are mutated ([#10570](https://github.com/sveltejs/svelte/pull/10570))

- fix: improve props spreading logic ([#10574](https://github.com/sveltejs/svelte/pull/10574))

## 5.0.0-next.62

### Patch Changes

- feat: allow state/derived/props to be explicitly exported from components ([#10523](https://github.com/sveltejs/svelte/pull/10523))

- fix: replace proxy-based readonly validation with stack-trace-based ownership tracking ([#10464](https://github.com/sveltejs/svelte/pull/10464))

- fix: correct context applied to batch_inspect ([#10569](https://github.com/sveltejs/svelte/pull/10569))

## 5.0.0-next.61

### Patch Changes

- fix: improve each block item equality for immutable mode ([#10537](https://github.com/sveltejs/svelte/pull/10537))

- fix: improve handling of unowned derived signals ([#10565](https://github.com/sveltejs/svelte/pull/10565))

- fix: better handling of empty text node hydration ([#10545](https://github.com/sveltejs/svelte/pull/10545))

- fix: ensure update methods of actions and reactive statements work with fine-grained `$state` ([#10543](https://github.com/sveltejs/svelte/pull/10543))

- fix: don't execute scripts inside `@html` when instantiated on the client ([#10556](https://github.com/sveltejs/svelte/pull/10556))

- fix: only escape characters in SSR template ([#10555](https://github.com/sveltejs/svelte/pull/10555))

- fix: wire up `events` in `mount` correctly and fix its types ([#10553](https://github.com/sveltejs/svelte/pull/10553))

- fix: better handling of derived signals that have no dependencies ([#10558](https://github.com/sveltejs/svelte/pull/10558))

- fix: improve state store mutation compiler output ([#10561](https://github.com/sveltejs/svelte/pull/10561))

## 5.0.0-next.60

### Patch Changes

- fix: improve effect over-fire on store subscription init ([#10535](https://github.com/sveltejs/svelte/pull/10535))

- fix: use init properties when exporting non-state values in prod ([#10521](https://github.com/sveltejs/svelte/pull/10521))

## 5.0.0-next.59

### Patch Changes

- chore: improve code generation for `bind:this` in SSR mode ([#10524](https://github.com/sveltejs/svelte/pull/10524))

- fix: visit expression node in directives ([#10527](https://github.com/sveltejs/svelte/pull/10527))

## 5.0.0-next.58

### Patch Changes

- breaking: remove `createRoot`, adjust `mount`/`hydrate` APIs, introduce `unmount` ([#10516](https://github.com/sveltejs/svelte/pull/10516))

## 5.0.0-next.57

### Patch Changes

- fix: correctly scope CSS selectors with descendant combinators ([#10490](https://github.com/sveltejs/svelte/pull/10490))

- feat: implement support for `:is(...)` and `:where(...)` ([#10490](https://github.com/sveltejs/svelte/pull/10490))

- chore: treeshake unused store subscriptions in SSR mode ([#10506](https://github.com/sveltejs/svelte/pull/10506))

- fix: warn against accidental global event referenced ([#10442](https://github.com/sveltejs/svelte/pull/10442))

- fix: improve bind:this support for each blocks ([#10510](https://github.com/sveltejs/svelte/pull/10510))

- feat: implement nested CSS support ([#10490](https://github.com/sveltejs/svelte/pull/10490))

- breaking: encapsulate/remove selectors inside `:is(...)` and `:where(...)` ([#10490](https://github.com/sveltejs/svelte/pull/10490))

## 5.0.0-next.56

### Patch Changes

- feat: add hydrate method, make hydration treeshakeable ([#10497](https://github.com/sveltejs/svelte/pull/10497))

- fix: makes keyed each blocks consistent between dev and prod ([#10500](https://github.com/sveltejs/svelte/pull/10500))

- fix: subscribe to stores in `transition`,`animation`,`use` directives ([#10481](https://github.com/sveltejs/svelte/pull/10481))

## 5.0.0-next.55

### Patch Changes

- feat: derive destructured derived objects values ([#10488](https://github.com/sveltejs/svelte/pull/10488))

- fix: prevent infinite loop when writing to store using shorthand ([#10477](https://github.com/sveltejs/svelte/pull/10477))

- fix: add proper source map support ([#10459](https://github.com/sveltejs/svelte/pull/10459))

## 5.0.0-next.54

### Patch Changes

- breaking: replace `$derived.call` with `$derived.by` ([#10445](https://github.com/sveltejs/svelte/pull/10445))

- fix: improve global transition outro handling ([#10474](https://github.com/sveltejs/svelte/pull/10474))

## 5.0.0-next.53

### Patch Changes

- fix: only throw bind error when not passing a value ([#10090](https://github.com/sveltejs/svelte/pull/10090))

- fix: improve global transition handling of effect cleardown ([#10469](https://github.com/sveltejs/svelte/pull/10469))

- fix: improve handling of object property deletions ([#10456](https://github.com/sveltejs/svelte/pull/10456))

- fix: ensure inspect fires on prop changes ([#10468](https://github.com/sveltejs/svelte/pull/10468))

## 5.0.0-next.52

### Patch Changes

- fix: use hybrid scoping strategy for consistent specificity increase ([#10443](https://github.com/sveltejs/svelte/pull/10443))

- fix: throw validation error when binding to each argument in runes mode ([#10441](https://github.com/sveltejs/svelte/pull/10441))

- fix: make CSS animation declaration transformation more robust ([#10432](https://github.com/sveltejs/svelte/pull/10432))

- fix: handle sole empty expression tags ([#10433](https://github.com/sveltejs/svelte/pull/10433))

## 5.0.0-next.51

### Patch Changes

- fix: align `beforeUpdate`/`afterUpdate` behavior better with that in Svelte 4 ([#10408](https://github.com/sveltejs/svelte/pull/10408))

- fix: disallow exporting props, derived and reassigned state from within components ([#10430](https://github.com/sveltejs/svelte/pull/10430))

- fix: improve indexed each array reconcilation ([#10422](https://github.com/sveltejs/svelte/pull/10422))

- fix: add compiler error for each block mutations in runes mode ([#10428](https://github.com/sveltejs/svelte/pull/10428))

## 5.0.0-next.50

### Patch Changes

- fix: set `open` binding value in `<details>` ([#10413](https://github.com/sveltejs/svelte/pull/10413))

## 5.0.0-next.49

### Patch Changes

- fix: properly analyze group expressions ([#10410](https://github.com/sveltejs/svelte/pull/10410))

- fix: handle nested script tags ([#10416](https://github.com/sveltejs/svelte/pull/10416))

- fix: only update lazy properties that have actually changed ([#10415](https://github.com/sveltejs/svelte/pull/10415))

- fix: correctly determine binding scope of `let:` directives ([#10395](https://github.com/sveltejs/svelte/pull/10395))

- fix: run `onDestroy` callbacks during SSR ([#10297](https://github.com/sveltejs/svelte/pull/10297))

## 5.0.0-next.48

### Patch Changes

- chore: bump zimmerframe to fix bugs introduced in previous version ([#10405](https://github.com/sveltejs/svelte/pull/10405))

## 5.0.0-next.47

### Patch Changes

- chore: bump zimmerframe to resolve AST-traversal-related bugs ([`b63ab91c7b92ecec6e7e939d6d509fc3008cf048`](https://github.com/sveltejs/svelte/commit/b63ab91c7b92ecec6e7e939d6d509fc3008cf048))

## 5.0.0-next.46

### Patch Changes

- fix: allow `let:` directives on slot elements ([#10391](https://github.com/sveltejs/svelte/pull/10391))

- fix: repair each block length mismatches during hydration ([#10398](https://github.com/sveltejs/svelte/pull/10398))

## 5.0.0-next.45

### Patch Changes

- fix: correctly determine `bind:group` members ([#10368](https://github.com/sveltejs/svelte/pull/10368))

- fix: make inline doc links valid ([#10365](https://github.com/sveltejs/svelte/pull/10365))

## 5.0.0-next.44

### Patch Changes

- fix: bindings with typescript assertions ([#10329](https://github.com/sveltejs/svelte/pull/10329))

- fix: only reuse state proxies that belong to the current value ([#10343](https://github.com/sveltejs/svelte/pull/10343))

## 5.0.0-next.43

### Patch Changes

- fix: insert empty text nodes while hydrating, if necessary ([#9729](https://github.com/sveltejs/svelte/pull/9729))

- fix: correctly update tweened store initialized with nullish value ([#10356](https://github.com/sveltejs/svelte/pull/10356))

## 5.0.0-next.42

### Patch Changes

- breaking: snippets can now take multiple arguments, support default parameters. Because of this, the type signature has changed ([#9988](https://github.com/sveltejs/svelte/pull/9988))

- Use generic `T` as the return type for `$derived.call()` ([#10349](https://github.com/sveltejs/svelte/pull/10349))

- fix: replace TODO errors ([#10326](https://github.com/sveltejs/svelte/pull/10326))

- fix: add proper typings for `$derived.call` ([`6145be5c695a063c70944272a42d9c63fdd71d64`](https://github.com/sveltejs/svelte/commit/6145be5c695a063c70944272a42d9c63fdd71d64))

- fix: improve handling of unowned derived signals ([#10342](https://github.com/sveltejs/svelte/pull/10342))

- fix: correctly reference destructured derived binding in event handler ([#10333](https://github.com/sveltejs/svelte/pull/10333))

- fix: add `scrollend` event type ([#10337](https://github.com/sveltejs/svelte/pull/10337))

- fix: improve unstate handling of non enumerable properties ([#10348](https://github.com/sveltejs/svelte/pull/10348))

## 5.0.0-next.41

### Patch Changes

- fix: handle event delegation correctly when having sibling event listeners ([#10307](https://github.com/sveltejs/svelte/pull/10307))

- chore: add $derived.call rune ([#10240](https://github.com/sveltejs/svelte/pull/10240))

## 5.0.0-next.40

### Patch Changes

- chore: cleanup derived destruction ([#10303](https://github.com/sveltejs/svelte/pull/10303))

- fix: correctly parse at-rules containing special characters in strings ([#10221](https://github.com/sveltejs/svelte/pull/10221))

- fix: Add missing `miter-clip` and `arcs` values to `stroke-linejoin` attribute ([#10141](https://github.com/sveltejs/svelte/pull/10141))

## 5.0.0-next.39

### Patch Changes

- fix: handle deep assignments to `$state()` class properties correctly ([#10289](https://github.com/sveltejs/svelte/pull/10289))

- fix: prevent false positive store error in module script ([#10291](https://github.com/sveltejs/svelte/pull/10291))

- fix: allow type selector in `:global()` when it's at a start of a compound selector ([#10287](https://github.com/sveltejs/svelte/pull/10287))

## 5.0.0-next.38

### Patch Changes

- chore: improve should_proxy_or_freeze logic internally ([#10249](https://github.com/sveltejs/svelte/pull/10249))

- fix: add back `derived` type overload ([`776ac3c1762da5f8147c457a997a417cfae67e4c`](https://github.com/sveltejs/svelte/commit/776ac3c1762da5f8147c457a997a417cfae67e4c))

- fix: more robust url equality check at dev time ([`14d7b26897cbfa129847c446b0ecf9557d77ef7c`](https://github.com/sveltejs/svelte/commit/14d7b26897cbfa129847c446b0ecf9557d77ef7c))

- fix: correct increment/decrement code generation ([`2861ad66e054d2b14f382aaada4512e3e5d56db8`](https://github.com/sveltejs/svelte/commit/2861ad66e054d2b14f382aaada4512e3e5d56db8))

- fix: sanitize component event names ([#10235](https://github.com/sveltejs/svelte/pull/10235))

- fix: don't hoist function when already referenced in module scope ([`1538264bd5ed431d3048d54efe9c83c4db7fb42a`](https://github.com/sveltejs/svelte/commit/1538264bd5ed431d3048d54efe9c83c4db7fb42a))

- fix: try-catch deep read during `$inspect` ([#10270](https://github.com/sveltejs/svelte/pull/10270))

- fix: allow ts casts in bindings ([#10181](https://github.com/sveltejs/svelte/pull/10181))

- fix: allow `:global(..)` in compound selectors ([#10266](https://github.com/sveltejs/svelte/pull/10266))

- fix: hydrate controlled each blocks correctly ([#10259](https://github.com/sveltejs/svelte/pull/10259))

- chore: improve $state static reference warning heuristics ([#10275](https://github.com/sveltejs/svelte/pull/10275))

- fix: correctly cleanup unowned derived dependency memory ([#10280](https://github.com/sveltejs/svelte/pull/10280))

- fix: ensure proxy is updated before notifying listeners ([#10267](https://github.com/sveltejs/svelte/pull/10267))

## 5.0.0-next.37

### Patch Changes

- fix: skip certain slot validations for custom elements ([#10207](https://github.com/sveltejs/svelte/pull/10207))

- fix: add compiler error for invalid `<p>` contents ([#10201](https://github.com/sveltejs/svelte/pull/10201))

- fix: correctly apply event.currentTarget ([#10216](https://github.com/sveltejs/svelte/pull/10216))

- fix: ensure derived signals properly capture consumers ([#10213](https://github.com/sveltejs/svelte/pull/10213))

## 5.0.0-next.36

### Patch Changes

- fix: transform textarea and contenteditable binding expressions ([#10187](https://github.com/sveltejs/svelte/pull/10187))

- fix: improve transition outro easing ([#10190](https://github.com/sveltejs/svelte/pull/10190))

- fix: ensure unstate() only deeply applies to plain objects and arrays ([#10191](https://github.com/sveltejs/svelte/pull/10191))

- fix: improve invalid nested interactive element error ([#10199](https://github.com/sveltejs/svelte/pull/10199))

- fix: react to mutated slot props in legacy mode ([#10197](https://github.com/sveltejs/svelte/pull/10197))

## 5.0.0-next.35

### Patch Changes

- fix: improve nested effect heuristics ([#10171](https://github.com/sveltejs/svelte/pull/10171))

- fix: simplify event delegation logic, only delegate event attributes ([#10169](https://github.com/sveltejs/svelte/pull/10169))

- fix: prevent transition action overfiring ([#10163](https://github.com/sveltejs/svelte/pull/10163))

- fix: improve event handling compatibility with delegation ([#10168](https://github.com/sveltejs/svelte/pull/10168))

- fix: ensure topological order for render effects ([#10175](https://github.com/sveltejs/svelte/pull/10175))

## 5.0.0-next.34

### Patch Changes

- fix: make `@types/estree` a dependency ([#10150](https://github.com/sveltejs/svelte/pull/10150))

- fix: improve intro transitions on dynamic mount ([#10162](https://github.com/sveltejs/svelte/pull/10162))

- fix: improve code generation ([#10156](https://github.com/sveltejs/svelte/pull/10156))

- fix: adjust `$inspect.with` type ([`c7cb90c91`](https://github.com/sveltejs/svelte/commit/c7cb90c91cd3553ad59126267c9bfddecbb290b4))

- fix: improve how transitions are handled on mount ([#10157](https://github.com/sveltejs/svelte/pull/10157))

- fix: adjust `parse` return type ([`a271878ab`](https://github.com/sveltejs/svelte/commit/a271878abe7018923839401129b18082eb2c811a))

## 5.0.0-next.33

### Patch Changes

- fix: improve ssr template code generation ([#10151](https://github.com/sveltejs/svelte/pull/10151))

- fix: improve template literal expression output generation ([#10147](https://github.com/sveltejs/svelte/pull/10147))

## 5.0.0-next.32

### Patch Changes

- fix: improve outro behavior with transitions ([#10139](https://github.com/sveltejs/svelte/pull/10139))

- chore: remove internal functions from `svelte/transition` exports ([#10132](https://github.com/sveltejs/svelte/pull/10132))

- fix: further animation transition improvements ([#10138](https://github.com/sveltejs/svelte/pull/10138))

- fix: improve animation transition heuristics ([#10119](https://github.com/sveltejs/svelte/pull/10119))

## 5.0.0-next.31

### Patch Changes

- fix: infer `svg` namespace correctly ([#10027](https://github.com/sveltejs/svelte/pull/10027))

- fix: keep intermediate number value representations ([`d171a39b0`](https://github.com/sveltejs/svelte/commit/d171a39b0ad97e2a05de1f38bc76a3d345e2b3d5))

- feat: allow modifiying derived props ([#10080](https://github.com/sveltejs/svelte/pull/10080))

- fix: improve signal consumer tracking behavior ([#10121](https://github.com/sveltejs/svelte/pull/10121))

- fix: support async/await in destructuring assignments ([#9962](https://github.com/sveltejs/svelte/pull/9962))

- fix: take into account member expressions when determining legacy reactive dependencies ([#10128](https://github.com/sveltejs/svelte/pull/10128))

- fix: make `ComponentType` generic optional ([`14dbc1be1`](https://github.com/sveltejs/svelte/commit/14dbc1be1720ff69e6f3c407e43c9c0765b0c140))

- fix: silence false positive state warning ([`dda4ad510`](https://github.com/sveltejs/svelte/commit/dda4ad510f1907a114a16227c3412eb00bd21738))

- fix: ensure nested blocks are inert during outro transitions ([#10126](https://github.com/sveltejs/svelte/pull/10126))

- fix: improve ssr template literal generation ([#10127](https://github.com/sveltejs/svelte/pull/10127))

## 5.0.0-next.30

### Patch Changes

- fix: allow transition undefined payload ([#10117](https://github.com/sveltejs/svelte/pull/10117))

- fix: apply key animations on proxied arrays ([#10113](https://github.com/sveltejs/svelte/pull/10113))

- fix: improve internal signal dependency checking logic ([#10111](https://github.com/sveltejs/svelte/pull/10111))

- fix: correctly call exported state ([#10114](https://github.com/sveltejs/svelte/pull/10114))

- fix: take into account setters when spreading and binding ([#10091](https://github.com/sveltejs/svelte/pull/10091))

- fix: transform `{@render ...}` expression ([#10116](https://github.com/sveltejs/svelte/pull/10116))

## 5.0.0-next.29

### Patch Changes

- fix: improve text node output ([#10081](https://github.com/sveltejs/svelte/pull/10081))

- fix: improve style parser whitespace handling ([#10077](https://github.com/sveltejs/svelte/pull/10077))

- fix: allow input elements within button elements ([#10083](https://github.com/sveltejs/svelte/pull/10083))

- fix: support TypeScript's `satisfies` operator ([#10068](https://github.com/sveltejs/svelte/pull/10068))

- fix: provide `unstate` in server environment ([`877ff1ee7`](https://github.com/sveltejs/svelte/commit/877ff1ee7d637e2248145d975748e1012a977396))

- fix: improve key block reactivity detection ([#10092](https://github.com/sveltejs/svelte/pull/10092))

- fix: always treat spread attributes as reactive and separate them if needed ([#10071](https://github.com/sveltejs/svelte/pull/10071))

## 5.0.0-next.28

### Patch Changes

- fix: deeply unstate objects passed to inspect ([#10056](https://github.com/sveltejs/svelte/pull/10056))

- fix: handle delegated events of elements moved outside the container ([#10060](https://github.com/sveltejs/svelte/pull/10060))

- fix: improve script `lang` attribute detection ([#10046](https://github.com/sveltejs/svelte/pull/10046))

- fix: improve pseudo class parsing ([#10055](https://github.com/sveltejs/svelte/pull/10055))

- fix: add types for popover attributes and events ([#10041](https://github.com/sveltejs/svelte/pull/10041))

- fix: skip generating $.proxy() calls for unary and binary expressions ([#9979](https://github.com/sveltejs/svelte/pull/9979))

- fix: allow pseudo classes after `:global(..)` ([#10055](https://github.com/sveltejs/svelte/pull/10055))

- fix: bail-out event handler referencing each index ([#10063](https://github.com/sveltejs/svelte/pull/10063))

- fix: parse `:nth-of-type(xn+y)` correctly ([#9970](https://github.com/sveltejs/svelte/pull/9970))

- fix: ensure if block is executed in correct order ([#10053](https://github.com/sveltejs/svelte/pull/10053))

## 5.0.0-next.27

### Patch Changes

- fix: evaluate transition parameters when the transition runs ([#9836](https://github.com/sveltejs/svelte/pull/9836))

- feat: add `$state.frozen` rune ([#9851](https://github.com/sveltejs/svelte/pull/9851))

- fix: correctly transform prop fallback values that use other props ([#9985](https://github.com/sveltejs/svelte/pull/9985))

- fix: escape template literal characters in text sequences ([#9973](https://github.com/sveltejs/svelte/pull/9973))

- fix: inject comment in place of `<noscript>` in client output ([#9953](https://github.com/sveltejs/svelte/pull/9953))

## 5.0.0-next.26

### Patch Changes

- fix: better handle array property deletion reactivity ([#9921](https://github.com/sveltejs/svelte/pull/9921))

- fix: improve event delegation handler hoisting ([#9929](https://github.com/sveltejs/svelte/pull/9929))

## 5.0.0-next.25

### Patch Changes

- fix: improve whitespace handling ([#9912](https://github.com/sveltejs/svelte/pull/9912))

- fix: improve each block fallback handling ([#9914](https://github.com/sveltejs/svelte/pull/9914))

- fix: cleanup each block animations on destroy ([#9917](https://github.com/sveltejs/svelte/pull/9917))

## 5.0.0-next.24

### Patch Changes

- fix: improve props aliasing ([#9900](https://github.com/sveltejs/svelte/pull/9900))

- feat: add support for `{@const}` inside snippet block ([#9904](https://github.com/sveltejs/svelte/pull/9904))

- fix: improve attribute directive reactivity detection ([#9907](https://github.com/sveltejs/svelte/pull/9907))

- fix: improve $inspect batching ([#9902](https://github.com/sveltejs/svelte/pull/9902))

- chore: improve readonly prop messaging ([#9901](https://github.com/sveltejs/svelte/pull/9901))

- fix: better support for top-level snippet declarations ([#9898](https://github.com/sveltejs/svelte/pull/9898))

## 5.0.0-next.23

### Patch Changes

- feat: add `gamepadconnected` and `gamepaddisconnected` events ([#9861](https://github.com/sveltejs/svelte/pull/9861))

- fix: improve unstate type definition ([#9895](https://github.com/sveltejs/svelte/pull/9895))

- fix: correctly reflect readonly proxy marker ([#9893](https://github.com/sveltejs/svelte/pull/9893))

- chore: improve each block fast-path heuristic ([#9855](https://github.com/sveltejs/svelte/pull/9855))

- fix: improve html tag svg behaviour ([#9894](https://github.com/sveltejs/svelte/pull/9894))

- fix: ensure class constructor values are proxied ([#9888](https://github.com/sveltejs/svelte/pull/9888))

- fix: improve each block index handling ([#9889](https://github.com/sveltejs/svelte/pull/9889))

## 5.0.0-next.22

### Patch Changes

- fix: handle event hoisting props referencing ([#9846](https://github.com/sveltejs/svelte/pull/9846))

- fix: support dynamic transition functions ([#9844](https://github.com/sveltejs/svelte/pull/9844))

- fix: ensure action function returns object ([#9848](https://github.com/sveltejs/svelte/pull/9848))

## 5.0.0-next.21

### Patch Changes

- chore: refactor props handling ([#9826](https://github.com/sveltejs/svelte/pull/9826))

- fix: improve each key animations ([#9842](https://github.com/sveltejs/svelte/pull/9842))

- chore: avoid creating thunk for call expressions when appropriate ([#9841](https://github.com/sveltejs/svelte/pull/9841))

- fix: improve signal consumer removal logic ([#9837](https://github.com/sveltejs/svelte/pull/9837))

- fix: ensure computed props are wrapped in derived ([#9835](https://github.com/sveltejs/svelte/pull/9835))

- fix: better handle unowned derived signals ([#9832](https://github.com/sveltejs/svelte/pull/9832))

- fix: improve each block with animate ([#9839](https://github.com/sveltejs/svelte/pull/9839))

- breaking: change `$inspect` API ([#9838](https://github.com/sveltejs/svelte/pull/9838))

## 5.0.0-next.20

### Patch Changes

- fix: better readonly checks for proxies ([#9808](https://github.com/sveltejs/svelte/pull/9808))

- fix: prevent infinite loops stemming from invalidation method ([#9811](https://github.com/sveltejs/svelte/pull/9811))

- fix: improve non state referenced warning ([#9809](https://github.com/sveltejs/svelte/pull/9809))

- fix: reuse existing proxy when object has multiple references ([#9821](https://github.com/sveltejs/svelte/pull/9821))

- fix: improve consistency issues around binding invalidation ([#9810](https://github.com/sveltejs/svelte/pull/9810))

- fix: tweak css nth regex ([#9806](https://github.com/sveltejs/svelte/pull/9806))

- fix: adjust children snippet default type ([`dcdd64548`](https://github.com/sveltejs/svelte/commit/dcdd645480ab412eb563632e70801f4d61c1d787))

- fix: correctly apply scope on component children ([#9824](https://github.com/sveltejs/svelte/pull/9824))

## 5.0.0-next.19

### Patch Changes

- feat: add unstate utility function ([#9776](https://github.com/sveltejs/svelte/pull/9776))

- fix: ensure proxied array length is updated ([#9782](https://github.com/sveltejs/svelte/pull/9782))

- chore: fix compiler errors test suite ([#9754](https://github.com/sveltejs/svelte/pull/9754))

- fix: ensure transitions properly cancel on completion ([#9778](https://github.com/sveltejs/svelte/pull/9778))

- feat: make fallback prop values readonly ([#9789](https://github.com/sveltejs/svelte/pull/9789))

- fix: tweak invalid dollar prefix rules around function args ([#9792](https://github.com/sveltejs/svelte/pull/9792))

- fix: ensure generated code does not use keywords as variable names ([#9790](https://github.com/sveltejs/svelte/pull/9790))

- feat: disallow fallback values with bindings in runes mode ([#9784](https://github.com/sveltejs/svelte/pull/9784))

- fix: apply event attribute validation to elements only ([#9772](https://github.com/sveltejs/svelte/pull/9772))

- fix: handle css nth-selector syntax ([#9754](https://github.com/sveltejs/svelte/pull/9754))

- feat: throw descriptive error for using runes globals outside of Svelte-compiled files ([#9773](https://github.com/sveltejs/svelte/pull/9773))

## 5.0.0-next.18

### Patch Changes

- feat: proxied state ([#9739](https://github.com/sveltejs/svelte/pull/9739))

- chore: more validation errors ([#9723](https://github.com/sveltejs/svelte/pull/9723))

- fix: allow duplicate snippet declaration names ([#9759](https://github.com/sveltejs/svelte/pull/9759))

- fix: ensure computed props are cached with derived ([#9757](https://github.com/sveltejs/svelte/pull/9757))

- fix: ensure event handlers containing arguments are not hoisted ([#9758](https://github.com/sveltejs/svelte/pull/9758))

## 5.0.0-next.17

### Patch Changes

- fix: improve `$inspect` type definition ([#9731](https://github.com/sveltejs/svelte/pull/9731))

- fix: correctly inspect derived values ([#9731](https://github.com/sveltejs/svelte/pull/9731))

## 5.0.0-next.16

### Patch Changes

- fix: delegate events on elements with bind-this ([#9696](https://github.com/sveltejs/svelte/pull/9696))

- fix: ensure implicit children snippet renders correctly ([#9706](https://github.com/sveltejs/svelte/pull/9706))

- fix: ensure `$slots` exists in runes mode ([#9718](https://github.com/sveltejs/svelte/pull/9718))

- fix: allow `bind:this` with dynamic type on inputs ([#9713](https://github.com/sveltejs/svelte/pull/9713))

- fix: port over props that were set prior to initialisation ([#9704](https://github.com/sveltejs/svelte/pull/9704))

- feat: $inspect rune ([#9705](https://github.com/sveltejs/svelte/pull/9705))

- fix: keep fallback value after spread update not setting that prop ([#9717](https://github.com/sveltejs/svelte/pull/9717))

- fix: tweak const tag parsing ([#9715](https://github.com/sveltejs/svelte/pull/9715))

- chore: remove redundant hydration code ([#9698](https://github.com/sveltejs/svelte/pull/9698))

- fix: improve template text node serialization ([#9722](https://github.com/sveltejs/svelte/pull/9722))

- fix: improve infinite loop capturing ([#9721](https://github.com/sveltejs/svelte/pull/9721))

## 5.0.0-next.15

### Patch Changes

- fix: add children to element typings ([#9679](https://github.com/sveltejs/svelte/pull/9679))

- fix: handle ts expressions when dealing with runes ([#9681](https://github.com/sveltejs/svelte/pull/9681))

## 5.0.0-next.14

### Patch Changes

- feat: warn on references to mutated non-state in template ([#9669](https://github.com/sveltejs/svelte/pull/9669))

- fix: prevent reactive snippet from reinitializing unnecessarily ([#9665](https://github.com/sveltejs/svelte/pull/9665))

- fix: take event attributes into account when checking a11y ([#9664](https://github.com/sveltejs/svelte/pull/9664))

- feat: add $effect.root rune ([#9638](https://github.com/sveltejs/svelte/pull/9638))

- feat: support type definition in {@const} ([#9609](https://github.com/sveltejs/svelte/pull/9609))

- feat: ignore `src`, `srcset`, and `href` attributes when hydrating ([#9662](https://github.com/sveltejs/svelte/pull/9662))

- chore: bump esrap ([#9649](https://github.com/sveltejs/svelte/pull/9649))

- chore: improve `<svelte:element>` generated code ([#9648](https://github.com/sveltejs/svelte/pull/9648))

- chore: prevent some unused variable creation ([#9571](https://github.com/sveltejs/svelte/pull/9571))

## 5.0.0-next.13

### Patch Changes

- fix: apply keyed validation only for keyed each ([#9641](https://github.com/sveltejs/svelte/pull/9641))

- fix: omit this bind this arg if we know it's not a signal ([#9635](https://github.com/sveltejs/svelte/pull/9635))

- fix: improve each block index handling ([#9644](https://github.com/sveltejs/svelte/pull/9644))

## 5.0.0-next.12

### Patch Changes

- fix: adjust mount and createRoot types ([`63e583184`](https://github.com/sveltejs/svelte/commit/63e58318460dbb3485df93d15beb2779a86d2c9a))

- fix: remove constructor overload ([`cb4b1f0a1`](https://github.com/sveltejs/svelte/commit/cb4b1f0a189803bed04adcb90fbd4334782e8469))

- fix: type-level back-compat for default slot and children prop ([`a3bc7d569`](https://github.com/sveltejs/svelte/commit/a3bc7d5698425ec9dde86eb302f2fd56d9da8f96))

## 5.0.0-next.11

### Patch Changes

- feat: add type of `$effect.active` ([#9624](https://github.com/sveltejs/svelte/pull/9624))

- fix: correct bind this multiple bindings ([#9617](https://github.com/sveltejs/svelte/pull/9617))

- chore: reuse common templates ([#9601](https://github.com/sveltejs/svelte/pull/9601))

- fix: handle undefined bubble events ([#9614](https://github.com/sveltejs/svelte/pull/9614))

- fix: dont error on stores looking like runes when runes explicitly turned off ([#9615](https://github.com/sveltejs/svelte/pull/9615))

- fix: improve member expression mutation logic ([#9625](https://github.com/sveltejs/svelte/pull/9625))

- chore: untrack keyed validation logic ([#9618](https://github.com/sveltejs/svelte/pull/9618))

- fix: ensure snippets have correct scope ([#9623](https://github.com/sveltejs/svelte/pull/9623))

- fix: better attribute casing logic ([#9626](https://github.com/sveltejs/svelte/pull/9626))

## 5.0.0-next.10

### Patch Changes

- chore: add inline new class warning ([#9583](https://github.com/sveltejs/svelte/pull/9583))

- fix: prevent false positives when detecting runes mode ([#9599](https://github.com/sveltejs/svelte/pull/9599))

- fix: deconflict generated names against globals ([#9570](https://github.com/sveltejs/svelte/pull/9570))

- chore: bump esrap ([#9590](https://github.com/sveltejs/svelte/pull/9590))

- feat: add $effect.active rune ([#9591](https://github.com/sveltejs/svelte/pull/9591))

- feat: add Snippet type ([#9584](https://github.com/sveltejs/svelte/pull/9584))

- fix: adjust event delegation heuristics ([#9581](https://github.com/sveltejs/svelte/pull/9581))

- chore: remove unused code ([#9593](https://github.com/sveltejs/svelte/pull/9593))

- fix: adjust regex ([#9572](https://github.com/sveltejs/svelte/pull/9572))

## 5.0.0-next.9

### Patch Changes

- chore: more transition code-golfing ([#9536](https://github.com/sveltejs/svelte/pull/9536))

- feat: native TypeScript support ([#9482](https://github.com/sveltejs/svelte/pull/9482))

## 5.0.0-next.8

### Patch Changes

- chore: rename internal object properties ([#9532](https://github.com/sveltejs/svelte/pull/9532))

## 5.0.0-next.7

### Patch Changes

- chore: more signal perf tuning ([#9531](https://github.com/sveltejs/svelte/pull/9531))

- fix: address intro transition bugs ([#9528](https://github.com/sveltejs/svelte/pull/9528))

- chore: tweak signals for better runtime perf ([#9529](https://github.com/sveltejs/svelte/pull/9529))

## 5.0.0-next.6

### Patch Changes

- fix: do not propagate global intro transitions ([#9515](https://github.com/sveltejs/svelte/pull/9515))

## 5.0.0-next.5

### Patch Changes

- fix: tweak script/style tag parsing/preprocessing logic ([#9502](https://github.com/sveltejs/svelte/pull/9502))

- fix: emit useful error on invalid binding to derived state ([#9497](https://github.com/sveltejs/svelte/pull/9497))

- fix: address unowned propagation signal issue ([#9510](https://github.com/sveltejs/svelte/pull/9510))

- fix: add top level snippets to instance scope ([#9467](https://github.com/sveltejs/svelte/pull/9467))

- fix: only treat instance context exports as accessors ([#9500](https://github.com/sveltejs/svelte/pull/9500))

- fix: allow setting files binding for `<input type="file" />` ([#9463](https://github.com/sveltejs/svelte/pull/9463))

- fix: add missing visitor for assignments during compilation ([#9511](https://github.com/sveltejs/svelte/pull/9511))

## 5.0.0-next.4

### Patch Changes

- revert: address bug in before/after update ([#9480](https://github.com/sveltejs/svelte/pull/9480))

## 5.0.0-next.3

### Patch Changes

- chore: use internal `get_descriptors` helper ([#9389](https://github.com/sveltejs/svelte/pull/9389))

- chore: improve bundle code size ([#9476](https://github.com/sveltejs/svelte/pull/9476))

- fix: coerce attribute value to string before comparison ([#9475](https://github.com/sveltejs/svelte/pull/9475))

- fix: handle private fields in `class` in `.svelte.js` files ([#9394](https://github.com/sveltejs/svelte/pull/9394))

- chore: make operations lazy ([#9468](https://github.com/sveltejs/svelte/pull/9468))

- fix: allow svelte:self in snippets ([#9439](https://github.com/sveltejs/svelte/pull/9439))

- fix: check that snippet is not rendered as a component ([#9423](https://github.com/sveltejs/svelte/pull/9423))

- patch: ensure keyed each block fallback to indexed each block ([#9441](https://github.com/sveltejs/svelte/pull/9441))

- fix: allow member access on directives ([#9462](https://github.com/sveltejs/svelte/pull/9462))

- fix: handle dynamic selects with falsy select values ([#9471](https://github.com/sveltejs/svelte/pull/9471))

- fix: ensure dynamic attributes containing call expressions update ([#9443](https://github.com/sveltejs/svelte/pull/9443))

- fix: corrects a beforeUpdate/afterUpdate bug ([#9448](https://github.com/sveltejs/svelte/pull/9448))

- fix: add missing files binding ([#9415](https://github.com/sveltejs/svelte/pull/9415))

- fix: only escape attribute values for elements, not components ([#9456](https://github.com/sveltejs/svelte/pull/9456))

- fix: handle event attribute spreading with event delegation ([#9433](https://github.com/sveltejs/svelte/pull/9433))

- fix: support class exports ([#9465](https://github.com/sveltejs/svelte/pull/9465))

- fix: treat `slot` the same as other props ([#9457](https://github.com/sveltejs/svelte/pull/9457))

## 5.0.0-next.2

### Patch Changes

- breaking: remove selector api ([#9426](https://github.com/sveltejs/svelte/pull/9426))

- fix: correct update_block index type ([#9425](https://github.com/sveltejs/svelte/pull/9425))

- fix: tighten up signals implementation ([#9417](https://github.com/sveltejs/svelte/pull/9417))

- fix: exclude internal props from spread attributes ([#9384](https://github.com/sveltejs/svelte/pull/9384))

- chore: improve keyblock treeshaking ([#9422](https://github.com/sveltejs/svelte/pull/9422))

- breaking: remove Component type, keep using SvelteComponent instead ([#9413](https://github.com/sveltejs/svelte/pull/9413))

- fix: add snippet marker symbol to children prop ([#9395](https://github.com/sveltejs/svelte/pull/9395))

## 5.0.0-next.1

### Patch Changes

- breaking: svelte 5 alpha ([#9381](https://github.com/sveltejs/svelte/pull/9381))
