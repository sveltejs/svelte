---
title: Accessibility warnings
---

Accessibility (shortened to a11y) isn't always easy to get right, but Svelte will help by warning you if you write inaccessible markup.

Here is a list of accessibility checks Svelte will do it for you.

---

### `a11y-accesskey`

Enforce no `accesskey` on element. Access keys are HTML attributes that allow web developers to assign keyboard shortcuts to elements. Inconsistencies between keyboard shortcuts and keyboard commands used by screenreader and keyboard only users create accessibility complications so to avoid complications, access keys should not be used.

```sv
<!-- A11y: Avoid using accesskey -->
<div accessKey='z'></div>
```

---

### `a11y-aria-attributes`

Certain reserved DOM elements do not support ARIA roles, states and properties. This is often because they are not visible, for example `meta`, `html`, `script`, `style`. This rule enforces that these DOM elements do not contain the `aria-*` props.

```sv
<!-- A11y: <meta> should not have aria-* attributes -->
<meta aria-hidden="false">
```

---

### `a11y-autofocus`

Enforce that `autofocus` is not used on elements. Autofocusing elements can cause usability issues for sighted and non-sighted users, alike.

```sv
<!-- A11y: Avoid using autofocus -->
<input autofocus>
```

---

### `a11y-distracting-elements`

Enforces that no distracting elements are used. Elements that can be visually distracting can cause accessibility issues with visually impaired users. Such elements are most likely deprecated, and should be avoided.

The following elements are visually distracting: `<marquee>` and `<blink>`.

```sv
<!-- A11y: Avoid <marquee> elements -->
<marquee />
```

---

### `a11y-hidden`

Certain DOM elements are useful for screen readers navigation and should not be hidden.

```sv
<!-- A11y: <h2> element should not be hidden -->
<h2 aria-hidden>invisible header</h2>
```

---

### `a11y-img-redundant-alt`

Enforce img alt attribute does not contain the word image, picture, or photo. Screenreaders already announce `img` elements as an image. There is no need to use words such as _image_, _photo_, and/or _picture_.

```sv
<img src="foo" alt="Foo eating a sandwich." />

<!-- aria-hidden, won't be announced by screen reader -->
<img src="bar" aria-hidden alt="Picture of me taking a photo of an image" />

<!-- A11y: Screenreaders already announce <img> elements as an image. -->
<img src="foo" alt="Photo of foo being weird." />

<!-- A11y: Screenreaders already announce <img> elements as an image. -->
<img src="bar" alt="Image of me at a bar!" />

<!-- A11y: Screenreaders already announce <img> elements as an image. -->
<img src="foo" alt="Picture of baz fixing a bug." />
```

---

### `a11y-invalid-attribute`

Enforce that accessibility attribute should have valid value

```sv
<!-- A11y: '' is not a valid href attribute -->
<a href=''>invalid</a>
```

---

### `a11y-label-has-associated-control`

Enforce that a label tag has a text label and an associated control.

There are two supported ways to associate a label with a control:

- Wrapping a control in a label tag.
- Adding `for` to a label and assigning it a DOM ID string that indicates an input on the page.

```sv
<label for="id">B</label>

<label>C <input type="text" /></label>

<!-- A11y: A form label must be associated with a control. -->
<label>A</label>
```

---

### `a11y-media-has-caption`

Providing captions for media is essential for deaf users to follow along. Captions should be a transcription or translation of the dialogue, sound effects, relevant musical cues, and other relevant audio information. Not only is this important for accessibility, but can also be useful for all users in the case that the media is unavailable (similar to `alt` text on an image when an image is unable to load).

The captions should contain all important and relevant information to understand the corresponding media. This may mean that the captions are not a 1:1 mapping of the dialogue in the media content. However, captions are not necessary for video components with the `muted` attribute.

```sv
<video><track kind="captions"/></video>

<audio muted></audio>

<!-- A11y: Media elements must have a <track kind=\"captions\"> -->
<video></video>

<!-- A11y: Media elements must have a <track kind=\"captions\"> -->
<video><track /></video>
```

---

### `a11y-misplaced-role`

Certain reserved DOM elements do not support ARIA roles, states and properties. This is often because they are not visible, for example `meta`, `html`, `script`, `style`. This rule enforces that these DOM elements do not contain the `role` props.

```sv
<!-- A11y: <meta> should not have role attribute -->
<meta role="tooltip">
```

---

### `a11y-misplaced-scope`

The scope scope should be used only on `<th>` elements.

```sv
<!-- A11y: The scope attribute should only be used with <th> elements -->
<div scope/>
```

---

### `a11y-missing-attribute`

Enforce that element should have required accessibility attribute

```sv
<!-- A11y: <input type=\"image\"> element should have an alt, aria-label or aria-labelledby attribute -->
<input type="image">

<!-- A11y: <html> element should have a lang attribute -->
<html></html>

<!-- A11y: <a> element should have an href attribute -->
<a>text</a>
```

---

### `a11y-missing-content`

Enforce that heading elements (`h1`, `h2`, etc.) and anchors have content and that the content is accessible to screen readers

```sv
<!-- A11y: <a> element should have child content -->
<a href='/foo'></a>

<!-- A11y: <h1> element should have child content -->
<h1></h1>
```

---

### `a11y-no-onchange`

Enforce usage of `on:blur` over/in parallel with `on:change` on select menu elements for accessibility. `on:blur` should be used instead of `on:change`, unless absolutely necessary and it causes no negative consequences for keyboard only or screen reader users. `on:blur` is a more declarative action by the user: for instance in a dropdown, using the arrow keys to toggle between options will trigger the `on:change` event in some browsers. Regardless, when a change of context results from an `on:blur` event or an `on:change` event, the user should be notified of the change unless it occurs below the currently focused element.

```sv
<select on:change={e => {}} on:blur={e => {}}>
    <option>foo</option>
    <option>bar</option>
</select>

<!-- A11y: on:blur must be used instead of on:change, unless absolutely necessary and it causes no negative consequences for keyboard only or screen reader users. -->
<select on:change={e => {}}>
    <option>foo</option>
    <option>bar</option>
</select>
```

---

### `a11y-positive-tabindex`

Avoid positive `tabIndex` property values to synchronize the flow of the page with keyboard tab order.

```sv
<!-- A11y: avoid tabindex values above zero -->
<div tabindex='1'/>
```

---

### `a11y-structure`

Warns when accessibility related elements are not in a right structure.

```sv
<!-- A11y: <figcaption> must be an immediate child of <figure> -->
<div>
	<figcaption>Image caption</figcaption>
</div>
```

---

### `a11y-unknown-aria-attribute`

Invalid aria attribute. Enforces valid `aria-*` property based on [WAI-ARIA States and Properties spec](https://www.w3.org/WAI/PF/aria-1.1/states_and_properties)

```sv
<!-- A11y: Unknown aria attribute 'aria-labeledby' (did you mean 'labelledby'?) -->
<input type="image" aria-labeledby="foo">
```

---

### `a11y-unknown-role`

Elements with ARIA roles must use a valid, non-abstract ARIA role. A reference to role definitions can be found at [WAI-ARIA](https://www.w3.org/TR/wai-aria/#role_definitions) site.

```sv
<!-- A11y: Unknown role 'toooltip' (did you mean 'tooltip'?) -->
<div role="toooltip"></div>
```
