declare const brand: unique symbol;
type Brand<B> = { [brand]: B };
type Branded<T, B> = T & Brand<B>;
type AttachmentsKeySymbol = Branded<symbol, 'svelte.attachments'>;

/**
 * A unique symbol used for defining the attachments to be applied to an element or component.
 */
export const AttachmentsKey: AttachmentsKeySymbol;
