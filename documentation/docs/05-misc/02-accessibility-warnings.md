---
title: Avertissements d'accessibilité
---

L'accessibilité (souvent raccourcie en "a11y") est un sujet complexe, qu'il est courant de mal implémenter. Pour vous aider, Svelte vous avertit au moment de la compilation si vous écrivez du markup non accessible. Toutefois, gardez à l'esprit que de nombreux problèmes d'accessibilité ne peuvent être identifiés qu'au moment de l'exécution, à l'aide d'autres outils automatisés et en testant manuellement votre application.

Certains avertissements seront incorrects dans votre cas. Vous pouvez désactivez ces faux positifs en ajoutant le commentaire `<!-- svelte-ignore a11y-<code> -->` juste au dessus de la ligne causant l'avertissement. Exemple :

```svelte
<!-- svelte-ignore a11y-autofocus -->
<input autofocus />
```

Voici la liste des vérifications d'accessibilité que Svelte fera pour vous.

## `a11y-accesskey`

Assure de ne pas utiliser l'attribut `accesskey` sur des éléments. L'attribut HTML `accesskey` permet aux développeurs web d'attribuer des raccourcis clavier aux éléments. Les incohérences entre les raccourcis clavier et les commandes clavier utilisées par le lecteur d'écran et les utilisateurs du clavier créent des complications d'accessibilité. Pour éviter les complications, les touches d'accès ne doivent pas être utilisées.

<!-- prettier-ignore -->
```svelte
<!-- A11y: Avoid using accesskey -->
<div accessKey="z" />
```

## `a11y-aria-activedescendant-has-tabindex`

Un élément avec `aria-activedescendant`  doit pouvoir être navigable en utilisant la touche "Tab", il doit donc avoir un `tabindex` intrinsèque, ou déclarer `tabindex` comme attribut.

```svelte
<!-- A11y: Elements with attribute aria-activedescendant should have tabindex value -->
<div aria-activedescendant="some-id" />
```

## `a11y-aria-attributes`

Certains éléments <span class="vo">[DOM](/docs/web#dom)</span> spéciaux ne prennent pas en charge les rôles, états et propriétés <span class="vo">[ARIA](/docs/web#aria)</span>. C'est souvent parce qu'ils ne sont pas visibles, comme `meta`, `html`, `script`, `style`. Cette règle garantit que ces éléments DOM ne contiennent pas des `aria-*` accessoires.

```svelte
<!-- A11y: <meta> should not have aria-* attributes -->
<meta aria-hidden="false" />
```

## `a11y-autofocus`

Interdit l’usage d'`autofocus` sur les éléments. Le focus automatique d'éléments peut entraîner des problèmes d'usage pour les utilisateurs, qu'ils soient malvoyants, non voyants ou avec une vue parfaite.

```svelte
<!-- A11y: Avoid using autofocus -->
<input autofocus />
```

## `a11y-click-events-have-key-events`

Assure que `on:click` soit accompagné d'au moins l'un des éléments suivants: `on:keyup`, `on:keydown`, `on:keypress`. Penser à l'usage au clavier est important pour les utilisateurs avec des handicaps physiques qui ne peuvent pas utiliser de souris, pour les utilisateurs de liseuses d'écran, ainsi que pour la compatibilité AT.

Cela ne s'applique pas aux éléments interactifs ou cachés.

```svelte
<!-- A11y: visible, non-interactive elements with an on:click event must be accompanied by an on:keydown, on:keyup, or on:keypress event. -->
<div on:click={() => {}} />
```

Notez que l'évènement `keypress` est maintenant déprécié, il est donc officiellement recommandé d'utiliser à la place les évènements `keyup` ou `keydown`, selon les besoins.

## `a11y-distracting-elements`

Assure qu'aucun élément distrayant ne soit utilisé. Les éléments distrayants visuellement peuvent causer des problèmes d'accessibilité avec les utilisateurs malvoyants. Ces éléments sont généralement dépréciés et doivent être évités.

Les éléments suivants sont visuellement distrayants: `<marquee>` et `<blink>`.

```svelte
<!-- A11y: Avoid <marquee> elements -->
<marquee />
```

## `a11y-hidden`

Certains éléments <span class="vo">[DOM](/docs/web#dom)</span> sont utiles pour la navigation avec lecteur d'écran et ne doivent pas être cachés.

<!-- prettier-ignore -->
```svelte
<!-- A11y: <h2> element should not be hidden -->
<h2 aria-hidden="true">invisible header</h2>
```

## `a11y-img-redundant-alt`

Assure que l'attribut `alt` des balises `img` ne contienne pas le mot "image" ou "photo". Les lecteurs d'écran décrivent déjà les éléments `img` comme étant des images. Il n'est pas nécessaire d'utiliser des mots tels que *photo* et / ou *image*.

```svelte
<img src="foo" alt="Foo mange un sandwich." />

<!-- A11y: aria-hidden, won't be announced by screen reader -->
<img src="bar" aria-hidden="true" alt="Photo de moi prenant une photo d'une image" />

<!-- A11y: Screen readers already announce <img> elements as an image. -->
<img src="foo" alt="Image de foo bizarre." />

<!-- A11y: Screen readers already announce <img> elements as an image. -->
<img src="bar" alt="Image de moi dans un bar !" />

<!-- A11y: Screen readers already announce <img> elements as an image. -->
<img src="foo" alt="Image de baz corrigeant un bug." />
```

## `a11y-incorrect-aria-attribute-type`

Assure que le bon type de valeur soit utilisé pour les attributs `aria`. Par exemple, `aria-hidden` ne devrait recevoir qu'un booléen.


```svelte
<!-- A11y: The value of 'aria-hidden' must be exactly one of true or false -->
<div aria-hidden="yes" />
```

## `a11y-invalid-attribute`

Assure que les attributs importants pour l'accessibilité aient une valeur valide. Par exemple, `href` ne devrait pas être vide, `'#'` ou `javascript:`.

```svelte
<!-- A11y: '' is not a valid href attribute -->
<a href="">invalide</a>
```

## `a11y-interactive-supports-focus`

Assure que les éléments avec un rôle interactif et des gestionnaires d'évènements interactifs (de souris ou de clavier) soient focalisables ou accessibles avec la touche Tab.

```svelte
<!-- A11y: Elements with the 'button' interactive role must have a tabindex value. -->
<div role="button" on:keypress={() => {}} />
```

## `a11y-label-has-associated-control`

Assure qu'un élément `label` ait une étiquette de texte et un contrôle associé.

Il existe deux méthodes prises en charge pour associer une étiquette à un contrôle :

- Envelopper un contrôle dans un élément `label`.
- Ajouter `for` à une étiquette et lui attribuer l'ID d'un champ d'entrée sur la page.

```svelte
<label for="id">B</label>

<label>C <input type="text" /></label>

<!-- A11y: A form label must be associated with a control. -->
<label>A</label>
```

## `a11y-media-has-caption`

Fournir des sous-titres pour les médias est essentiel afin que les utilisateurs sourds puissent suivre. Les sous-titres devraient être une transcription ou une traduction du dialogue, des effets sonores, des indications musicales pertinentes et d'autres informations audio pertinentes. Ce n'est pas seulement important pour l'accessibilité, mais peut également être utile pour tous les utilisateurs dans le cas où les médias ne sont pas disponibles (similaire au texte `alt` sur une image lorsqu'une image ne peut pas être chargée).

Les sous-titres doivent contenir toutes les informations importantes et pertinentes pour comprendre les médias correspondants. Cela peut signifier que les sous-titres ne sont pas une correspondance 1:1 du dialogue dans le contenu média. Cependant, les sous-titres ne sont pas nécessaires pour les composants vidéo avec l'attribut `muted`.

```svelte
<video><track kind="captions" /></video>

<audio muted />

<!-- A11y: Media elements must have a <track kind=\"captions\"> -->
<video />

<!-- A11y: Media elements must have a <track kind=\"captions\"> -->
<video><track /></video>
```

## `a11y-misplaced-role`

Certains éléments <span class="vo">[DOM](/docs/web#dom)</span> réservés ne prennent pas en charge les rôles, états et propriétés <span class="vo">[ARIA](/docs/web#aria)</span>. Cela est souvent dû à leur invisibilité, par exemple `meta`, `html`, `script`, `style`. Cette règle impose que ces éléments DOM ne contiennent pas l'attribut `role`.

```svelte
<!-- A11y: <meta> should not have role attribute -->
<meta role="tooltip" />
```

## `a11y-misplaced-scope`

L'attribut `scope` ne devrait être utilisé que sur les éléments `<th>`.

<!-- prettier-ignore -->
```svelte
<!-- A11y: The scope attribute should only be used with <th> elements -->
<div scope="row" />
```

## `a11y-missing-attribute`

Assure que les attributs requis pour l'accessibilité soient présents sur un élément. Cela inclut les vérifications suivantes:

- `<a>` devrait avoir un `href` (sauf s'il s'agit d'une [balise définissant un fragment](https://github.com/sveltejs/svelte/issues/4697))
- `<area>` devrait avoir `alt`, `aria-label` ou `aria-labelledby`
- `<html>` devrait avoir `lang`
- `<iframe>` devrait avoir `title`
- `<img>` devrait avoir `alt`
- `<object>` devrait avoir `title`, `aria-label` ou `aria-labelledby`
- `<input type="image">` devrait avoir `alt`, `aria-label` ou `aria-labelledby`

```svelte
<!-- A11y: <input type=\"image\"> element should have an alt, aria-label or aria-labelledby attribute -->
<input type="image" />

<!-- A11y: <html> element should have a lang attribute -->
<html />

<!-- A11y: <a> element should have an href attribute -->
<a>texte</a>
```

## `a11y-missing-content`

Assure que les éléments d'en-tête (`h1`, `h2`, etc.) et les ancres aient un contenu, et que ce contenu soit accessible aux lecteurs d'écran.

```svelte
<!-- A11y: <a> element should have child content -->
<a href="/foo" />

<!-- A11y: <h1> element should have child content -->
<h1 />
```

## `a11y-mouse-events-have-key-events`

Assure que `on:mouseover` and `on:mouseout` soient accompagnés de `on:focus` et `on:blur`, respectivement. Cela aide à garantir que toutes les fonctionnalités déclenchées par ces événements de souris soient également accessibles aux utilisateurs du clavier.

```svelte
<!-- A11y: on:mouseover must be accompanied by on:focus -->
<div on:mouseover={handleMouseover} />

<!-- A11y: on:mouseout must be accompanied by on:blur -->
<div on:mouseout={handleMouseout} />
```

## `a11y-no-redundant-roles`

Certains éléments HTML ont des rôles <span class="vo">[ARIA](/docs/web#aria)</span> par défaut. Donner à ces éléments un rôle ARIA déjà défini par le navigateur [n'a aucun effet](https://www.w3.org/TR/using-aria/#aria-does-nothing) et est redondant.

```svelte
<!-- A11y: Redundant role 'button' -->
<button role="button" />

<!-- A11y: Redundant role 'img' -->
<img role="img" src="foo.jpg" />
```

## `a11y-no-interactive-element-to-noninteractive-role`

Les rôles [WAI-ARIA](https://www.w3.org/TR/wai-aria-1.1/#usage_intro) ne devraient pas être utilisés pour convertir un élément interactif en un élément non interactif. Les rôles <span class="vo">[ARIA](/docs/web#aria)</span> non interactifs incluent `article`, `banner`, `complementary`, `img`, `listitem`, `main`, `region` et `tooltip`.

```svelte
<!-- A11y: <textarea> cannot have role 'listitem' -->
<textarea role="listitem" />
```

### `a11y-no-noninteractive-element-to-interactive-role`

Un élément non interactif ne supporte pas les gestionnaires d'événements (souris et clavier). Les éléments non interactifs incluent : `<main>`, `<area>`, `<h1>` (,`<h2>`, etc), `<p>`, `<img>`, `<li>`, `<ul>` and `<ol>`. Les [rôles WAI-ARIA](https://www.w3.org/TR/wai-aria-1.1/#usage_intro) interactifs incluent `button`, `link`, `checkbox`, `menuitem`, `menuitemcheckbox`, `menuitemradio`, `option`, `radio`, `searchbox`, `switch` et `textbox`.

```svelte
<!-- A11y: Non-interactive element <h3> cannot have interactive role 'searchbox' -->
<h3 role="searchbox">Bouton</h3>
```

## `a11y-no-noninteractive-tabindex`

La navigation à l'aide de la touche Tab doit être limitée aux éléments de la page avec lesquels il est possible d'interagir.

<!-- prettier-ignore -->
```svelte
<!-- A11y: noninteractive element cannot have nonnegative tabIndex value -->
<div tabindex="0" />
```

## `a11y-no-static-element-interactions`

Les éléments comme un `<div>` avec des gestionnaires d'événements comme `click` doivent avoir un rôle <span class="vo">[ARIA](/docs/web#aria)</span>.

<!-- prettier-ignore -->
```svelte
<!-- A11y: <div> with click handler must have an ARIA role -->
<div on:click={() => ''} />
```

## `a11y-positive-tabindex`

Évitez les valeurs positives pour la propriété `tabindex`. Cela positionnera des éléments en dehors de l'ordre de tabulation attendu, ce qui créera une expérience confuse pour les utilisateurs du clavier.

<!-- prettier-ignore -->
```svelte
<!-- A11y: avoid tabindex values above zero -->
<div tabindex="1" />
```

## `a11y-role-has-required-aria-props`

Les éléments avec des rôles <span class="vo">[ARIA](/docs/web#aria)</span> doivent avoir tous les attributs requis pour ce rôle.

```svelte
<!-- A11y: A11y: Elements with the ARIA role "checkbox" must have the following attributes defined: "aria-checked" -->
<span role="checkbox" aria-labelledby="foo" tabindex="0" />
```

## `a11y-role-supports-aria-props`

Les éléments avec un rôle explicite ou implicite doivent contenir uniquement des propriétés `aria-*` prévues pour ce rôles.

```svelte
<!-- A11y: The attribute 'aria-multiline' is not supported by the role 'link'. -->
<div role="link" aria-multiline />

<!-- A11y: The attribute 'aria-required' is not supported by the role 'listitem'. This role is implicit on the element <li>. -->
<li aria-required />
```

## `a11y-structure`

Assure que certains éléments <span class="vo">[DOM](/docs/web#dom)</span> aient la bonne structure.

```svelte
<!-- A11y: <figcaption> must be an immediate child of <figure> -->
<div>
	<figcaption>Légende de l'image</figcaption>
</div>
```

## `a11y-unknown-aria-attribute`

Assure que seuls les attributs <span class="vo">[ARIA](/docs/web#aria)</span> connus soient utilisés. Cela est basé sur la spécification [WAI-ARIA States and Properties](https://www.w3.org/WAI/PF/aria-1.1/states_and_properties).

```svelte
<!-- A11y: Unknown aria attribute 'aria-labeledby' (did you mean 'labelledby'?) -->
<input type="image" aria-labeledby="foo" />
```

## `a11y-unknown-role`

Les éléments avec des rôles <span class="vo">[ARIA](/docs/web#aria)</span> doivent utiliser un rôle ARIA valide et non abstrait. Une référence aux définitions de rôle peut être trouvée sur le site [WAI-ARIA](https://www.w3.org/TR/wai-aria/#role_definitions).

<!-- prettier-ignore -->
```svelte
<!-- A11y: Unknown role 'toooltip' (did you mean 'tooltip'?) -->
<div role="toooltip" />
```
