import Tag from './shared/Tag.ts';

import Action from './Action.ts';
import Animation from './Animation.ts';
import Attribute from './Attribute.ts';
import AwaitBlock from './AwaitBlock.ts';
import Binding from './Binding.ts';
import Body from './Body.ts';
import CatchBlock from './CatchBlock.ts';
import Class from './Class.ts';
import Comment from './Comment.ts';
import DebugTag from './DebugTag.ts';
import EachBlock from './EachBlock.ts';
import Element from './Element.ts';
import ElseBlock from './ElseBlock.ts';
import EventHandler from './EventHandler.ts';
import Fragment from './Fragment.ts';
import Head from './Head.ts';
import IfBlock from './IfBlock.ts';
import InlineComponent from './InlineComponent.ts';
import KeyBlock from './KeyBlock.ts';
import Let from './Let.ts';
import MustacheTag from './MustacheTag.ts';
import Options from './Options.ts';
import PendingBlock from './PendingBlock.ts';
import RawMustacheTag from './RawMustacheTag.ts';
import Slot from './Slot.ts';
import Text from './Text.ts';
import ThenBlock from './ThenBlock.ts';
import Title from './Title.ts';
import Transition from './Transition.ts';
import Window from './Window.ts';

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
| Tag
| Text
| ThenBlock
| Title
| Transition
| Window;
