import React from 'react';
import { 
  Component,
  TextComponent,
  HeadingComponent,
  ButtonComponent,
  CardComponent,
  ListComponent,
  TableComponent,
  ChartComponent,
  FormComponent,
  InputComponent,
  SelectComponent,
  AlertComponent,
  ProgressComponent,
  BadgeComponent,
  ImageComponent,
  DividerComponent,
  ContainerComponent,
  IconComponent,
  StackComponent,
  SectionComponent,
  SplitComponent,
  SpacerComponent,
  IllustrationComponent,
  CalloutComponent,
  StatComponent,
  AvatarComponent,
  TagGroupComponent,
} from '@re/core';
import * as Components from '../components';

export interface ComponentRendererProps {
  component: Component;
  onAction?: (actionId: string, data?: any) => void;
  onInputChange?: (name: string, value: any) => void;
}

export function ComponentRenderer({
  component,
  onAction,
  onInputChange,
}: ComponentRendererProps) {
  if (!component) {
    console.warn('ComponentRenderer received null/undefined component');
    return null;
  }

  const safeProps = component.props ?? {};
  const safeChildren = Array.isArray((component as any).children) ? (component as any).children : [];
  const safeComponent = { ...component, props: safeProps, children: safeChildren };

  switch (safeComponent.type) {
    case 'text':
      return <Components.Text props={(safeComponent as TextComponent).props} />;

    case 'heading':
      return <Components.Heading props={(safeComponent as HeadingComponent).props} />;

    case 'button':
      return <Components.Button props={(safeComponent as ButtonComponent).props} onAction={onAction} />;

    case 'card':
      return <Components.Card component={safeComponent as CardComponent} onAction={onAction} />;

    case 'list':
      return <Components.List props={(safeComponent as ListComponent).props} />;

    case 'table':
      return <Components.Table props={(safeComponent as TableComponent).props} />;

    case 'chart':
      return <Components.Chart props={(safeComponent as ChartComponent).props} />;

    case 'form':
      return <Components.Form component={safeComponent as FormComponent} onAction={onAction} />;

    case 'input':
      return <Components.Input props={(safeComponent as InputComponent).props} onInputChange={onInputChange} />;

    case 'select':
      return <Components.Select props={(safeComponent as SelectComponent).props} onInputChange={onInputChange} />;

    case 'alert':
      return <Components.Alert props={(safeComponent as AlertComponent).props} />;

    case 'progress':
      return <Components.Progress props={(safeComponent as ProgressComponent).props} />;

    case 'badge':
      return <Components.Badge props={(safeComponent as BadgeComponent).props} />;

    case 'image':
      return <Components.Image props={(safeComponent as ImageComponent).props} />;

    case 'divider':
      return <Components.Divider props={(safeComponent as DividerComponent).props} />;

    case 'container':
      return <Components.Container component={safeComponent as ContainerComponent} onAction={onAction} />;

    // New enhanced components
    case 'icon':
      return <Components.Icon props={(safeComponent as IconComponent).props} />;

    case 'stack':
      return <Components.Stack component={safeComponent as StackComponent} onAction={onAction} />;

    case 'section':
      return <Components.Section component={safeComponent as SectionComponent} onAction={onAction} />;

    case 'split':
      return <Components.Split component={safeComponent as SplitComponent} onAction={onAction} />;

    case 'spacer':
      return <Components.Spacer props={(safeComponent as SpacerComponent).props} />;

    case 'illustration':
      return <Components.Illustration props={(safeComponent as IllustrationComponent).props} />;

    case 'callout':
      return <Components.Callout component={safeComponent as CalloutComponent} onAction={onAction} />;

    case 'stat':
      return <Components.Stat props={(safeComponent as StatComponent).props} />;

    case 'avatar':
      return <Components.Avatar props={(safeComponent as AvatarComponent).props} />;

    case 'tag-group':
      return <Components.TagGroup props={(safeComponent as TagGroupComponent).props} onAction={onAction} />;

    default:
      console.warn(`Unknown component type: ${(safeComponent as any).type}`);
      return null;
  }
}
