import Tag from './shared/Tag';

import Action from './Action';
import Animation from './Animation';
import Attribute from './Attribute';
import AwaitBlock from './AwaitBlock';
import Binding from './Binding';
import Body from './Body';
import CatchBlock from './CatchBlock';
import Class from './Class';
import Comment from './Comment';
import DebugTag from './DebugTag';
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
import DefaultSlotTemplate from './DefaultSlotTemplate';
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
| DebugTag
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
| DefaultSlotTemplate
| Tag
| Text
| ThenBlock
| Title
| Transition
| Window;
