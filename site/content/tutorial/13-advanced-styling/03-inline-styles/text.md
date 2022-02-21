---
title: Inline styles and the style directive
---

Apart from adding styles inside style tags, you can also add styles to individual elements using the style attribute. Usually you will want to do styling through CSS, but this can come in handy for dynamic styles, especially when combined with CSS custom properties.

Add the following style attribute to the paragraph element:
`style="color: {color}; --o: {bgOpacity};"`

Great, now you can style the paragraph using variables that can change based on your input and you don't have to make a class for every possible value.

This can however get unwieldly if you have to write a rather long string, and missing any of the semicolons will make it invalid. Svelte provides a nicer way to write inline styles and that is to use the style directive like this:

```html
<p 
	style:color 
	style:--o={bgOpacity}
>
```

They share a few qualities with the class directive. You can use a shorthand when the name of the property and the variable are the same. So `style:color="{color}"` can be written as just `style:color`. Another is that the directives will take precedence when you set the same property through a style attribute.