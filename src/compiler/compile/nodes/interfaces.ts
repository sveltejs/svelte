import Tag from './shared/Tag';

import Action from './Action';
import Animation from './Animation';
import Attribute from './Attribute';
import AwaitBlock from './AwaitBlock';
import Binding from './Binding';
import Body from './Body';
import CatchBlock from './CatchBlock';
import Class from './Class';
import StyleDirective from './StyleDirective';
import Comment from './Comment';
import ConstTag from './ConstTag';
import DebugTag from './DebugTag';
import Document from './Document';
import EachBlock from './EachBlock';
import Element from './Element';
import ElseBlock from './ElseBlock';
import EventHandler from './EventHandler';
import Fragment from './Fragment';
import Head from './Head';
import IfBlock from './IfBlock';
import InlineComponent from './InlineComponent';
import KeyBlock from './KeyBlock';
import Let from './Let';
import MustacheTag from './MustacheTag';
import Options from './Options';
import PendingBlock from './PendingBlock';
import RawMustacheTag from './RawMustacheTag';
import Slot from './Slot';
import SlotTemplate from './SlotTemplate';
import Text from './Text';
import ThenBlock from './ThenBlock';
import Title from './Title';
import Transition from './Transition';
import Window from './Window';

// note: to write less types each of types in union below should have type defined as literal
// https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html#discriminating-unions
export type INode = Action
| Animation
| Attribute
| AwaitBlock
| Binding
| Body
| CatchBlock
| Class
| Comment
| ConstTag
| DebugTag
| Document
| EachBlock
| Element
| ElseBlock
| EventHandler
| Fragment
| Head
| IfBlock
| InlineComponent
| KeyBlock
| Let
| MustacheTag
| Options
| PendingBlock
| RawMustacheTag
| Slot
| SlotTemplate
| StyleDirective
| Tag
| Text
| ThenBlock
| Title
| Transition
| Window;

export type INodeAllowConstTag =
| IfBlock
| ElseBlock
| EachBlock
| CatchBlock
| ThenBlock
| InlineComponent
| SlotTemplate;
