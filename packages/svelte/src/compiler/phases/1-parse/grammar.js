/** The template language, as the parser reads it: the delimiters, the elements and their fields, the directives and the blocks. */
export const grammar = `
host svelte

document Root  css=style  js=list  options=null  comments=comments  module?=script:module  { instance?=script  { fragment=fragment } }
delimiters { }
attributes expressions shorthand
sigils open=# branch=: close=/ tag=@
autoclose
trim
void area base br col command embed hr img input keygen link meta param source track wbr
fragment Fragment nodes scope
elements name=name attributes=attributes children=fragment
text Text data=data raw=raw
comment Comment data=data

element svelte:element    SvelteElement    this=tag:text
element svelte:component  SvelteComponent  this=expression
element svelte:self       SvelteSelf
element svelte:window     SvelteWindow     root once
element svelte:document   SvelteDocument   root once
element svelte:body       SvelteBody       root once
element svelte:head       SvelteHead       root once
element svelte:options    SvelteOptions    root once
element svelte:fragment   SvelteFragment
element svelte:boundary   SvelteBoundary
element title             TitleElement     inside svelte:head
element slot              SlotElement      outside shadowrootmode
element textarea          RegularElement   rcdata
element script            RegularElement   raw
element style             RegularElement   raw
element component-name    Component
element *                 RegularElement

script script  module=context:module  module=module  typescript=lang:ts
style  style

directives arg=: modifier=| field:arg=name field:modifiers=modifiers
directive bind        BindDirective        expression?name  unique:attribute
directive on          OnDirective          expression?
directive use         UseDirective         expression?
directive class       ClassDirective       expression?name  unique
directive style       StyleDirective       value  unique
directive transition  TransitionDirective  expression?  intro outro
directive in          TransitionDirective  expression?  intro !outro
directive out         TransitionDirective  expression?  !intro outro
directive animate     AnimateDirective     expression?
directive let         LetDirective         pattern?name  declares

spread  SpreadAttribute  expression

block if  IfBlock  chain=elseif
  open    test=expression  -> consequent
  branch  else if test=expression  -> alternate chain consequent
  branch  else  -> alternate

block each  EachBlock
  open    expression=expression [ as context=pattern ] [ , index?=identifier ] [ ( key?=expression ) ]  -> body declares context index
  branch  else  -> fallback?

block await  AwaitBlock
  open    expression=expression [ then [ value=pattern ] -> then declares value | catch [ error=pattern ] -> catch declares error ]  -> pending
  branch  then [ value=pattern ]  -> then declares value
  branch  catch [ error=pattern ]  -> catch declares error

block key  KeyBlock
  open    expression=expression  -> fragment

block snippet  SnippetBlock
  open    expression=identifier [ typeParams?=typeParameters ] parameters=params  -> body declares expression:outside parameters

tag html    HtmlTag    expression=expression
tag debug   DebugTag   identifiers=identifiers
tag const   ConstTag   declaration=const
tag render  RenderTag  expression=expression
tag attach  AttachTag  expression=expression  attribute

declaration  DeclarationTag  declaration=statement
expression   ExpressionTag   expression=expression
`;
