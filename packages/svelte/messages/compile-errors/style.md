## css_empty_declaration

> Declaration cannot be empty

## css_expected_identifier

> Expected a valid CSS identifier

## css_global_block_invalid_combinator

> A `:global` selector cannot follow a `%name%` combinator

## css_global_block_invalid_declaration

> A top-level `:global {...}` block can only contain rules, not declarations

## css_global_block_invalid_list

> A `:global` selector cannot be part of a selector list with entries that don't contain `:global`

The following CSS is invalid:

```css
:global, x {
    y {
        color: red;
    }
}
```

This is mixing a `:global` block, which means "everything in here is unscoped", with a scoped selector (`x` in this case). As a result it's not possible to transform the inner selector (`y` in this case) into something that satisfies both requirements. You therefore have to split this up into two selectors:

```css
:global {
    y {
        color: red;
    }
}

x y {
    color: red;
}
```

## css_global_block_invalid_modifier

> A `:global` selector cannot modify an existing selector

## css_global_block_invalid_modifier_start

> A `:global` selector can only be modified if it is a descendant of other selectors

## css_global_block_invalid_placement

> A `:global` selector cannot be inside a pseudoclass

## css_global_invalid_placement

> `:global(...)` can be at the start or end of a selector sequence, but not in the middle

## css_global_invalid_selector

> `:global(...)` must contain exactly one selector

## css_global_invalid_selector_list

> `:global(...)` must not contain type or universal selectors when used in a compound selector

## css_nesting_selector_invalid_placement

> Nesting selectors can only be used inside a rule or as the first selector inside a lone `:global(...)`

## css_selector_invalid

> Invalid selector

## css_type_selector_invalid_placement

> `:global(...)` must not be followed by a type selector
