---
title: Inline styles and the style directive
---

Apart from adding styles inside style tags, you can also add styles to individual elements using the style attribute. Usually you will want to do styling through CSS, but this can come in handy for dynamic styles, especially when combined with CSS custom properties.

Add the following style attribute to the paragraph element:
`style="color: {color}; --o: {backgroundOpacity};"`

Great, now you can style the paragraph using variables that can change based on your input and you don't have to make a class for every possible value.

There is a way to make this look nicer though, and that is to use the style directive.

```html
<p 
	style:color 
	style:--o={backgroundOpacity}
>
```

Not only that but just like the class directive, you can use a shorthand when the name of the property and the variable are the same. So `style:color="{color}"` can be written as just `style:color`.