// Component type definitions for Re Generative UI

export type ComponentType =
  | 'text'
  | 'heading'
  | 'button'
  | 'card'
  | 'list'
  | 'table'
  | 'chart'
  | 'form'
  | 'input'
  | 'select'
  | 'image'
  | 'alert'
  | 'progress'
  | 'badge'
  | 'divider'
  | 'container'
  | 'icon'
  | 'stack'
  | 'section'
  | 'split'
  | 'spacer'
  | 'illustration'
  | 'callout'
  | 'stat'
  | 'avatar'
  | 'tag-group';

export interface BaseComponent {
  id: string;
  type: ComponentType;
  props?: Record<string, any>;
  children?: Component[];
}

export interface TextComponent extends BaseComponent {
  type: 'text';
  props: {
    content: string;
    size?: 'sm' | 'md' | 'lg';
    weight?: 'normal' | 'medium' | 'bold';
    color?: string;
  };
}

export interface HeadingComponent extends BaseComponent {
  type: 'heading';
  props: {
    content: string;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
  };
}

export interface ButtonComponent extends BaseComponent {
  type: 'button';
  props: {
    label: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    onClick?: string; // Action identifier
    disabled?: boolean;
  };
}

export interface CardComponent extends BaseComponent {
  type: 'card';
  props: {
    title?: string;
    description?: string;
    variant?: 'default' | 'outline' | 'filled';
  };
  children: Component[];
}

export interface ListComponent extends BaseComponent {
  type: 'list';
  props: {
    items: Array<{
      id: string;
      label: string;
      description?: string;
      icon?: string;
    }>;
    variant?: 'bullet' | 'numbered' | 'none';
  };
}

export interface TableComponent extends BaseComponent {
  type: 'table';
  props: {
    headers: string[];
    rows: Array<Record<string, any>>;
    sortable?: boolean;
    striped?: boolean;
  };
}

export interface ChartComponent extends BaseComponent {
  type: 'chart';
  props: {
    chartType: 'line' | 'bar' | 'pie' | 'area';
    data: Array<Record<string, any>>;
    xKey: string;
    yKey: string;
    title?: string;
  };
}

export interface FormComponent extends BaseComponent {
  type: 'form';
  props: {
    title?: string;
    submitLabel?: string;
    onSubmit?: string; // Action identifier
  };
  children: Component[];
}

export interface InputComponent extends BaseComponent {
  type: 'input';
  props: {
    name: string;
    label: string;
    placeholder?: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel';
    required?: boolean;
    defaultValue?: string;
  };
}

export interface SelectComponent extends BaseComponent {
  type: 'select';
  props: {
    name: string;
    label: string;
    options: Array<{ value: string; label: string }>;
    required?: boolean;
    defaultValue?: string;
  };
}

export interface ImageComponent extends BaseComponent {
  type: 'image';
  props: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    rounded?: boolean;
  };
}

export interface AlertComponent extends BaseComponent {
  type: 'alert';
  props: {
    title?: string;
    message: string;
    variant: 'info' | 'success' | 'warning' | 'error';
    dismissible?: boolean;
  };
}

export interface ProgressComponent extends BaseComponent {
  type: 'progress';
  props: {
    value: number;
    max?: number;
    label?: string;
    showPercentage?: boolean;
  };
}

export interface BadgeComponent extends BaseComponent {
  type: 'badge';
  props: {
    label: string;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  };
}

export interface DividerComponent extends BaseComponent {
  type: 'divider';
  props?: {
    label?: string;
  };
}

export interface ContainerComponent extends BaseComponent {
  type: 'container';
  props?: {
    direction?: 'row' | 'column';
    gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
    variant?: 'flex' | 'grid';
    cols?: number;
    wrap?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  };
  children: Component[];
}

// NEW COMPONENTS

export interface IconComponent extends BaseComponent {
  type: 'icon';
  props: {
    name: string; // Lucide icon name
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted' | string;
    strokeWidth?: number;
  };
}

export interface StackComponent extends BaseComponent {
  type: 'stack';
  props?: {
    gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    align?: 'start' | 'center' | 'end' | 'stretch';
    dividers?: boolean;
  };
  children: Component[];
}

export interface SectionComponent extends BaseComponent {
  type: 'section';
  props?: {
    title?: string;
    subtitle?: string;
    variant?: 'default' | 'card' | 'highlighted' | 'bordered';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    background?: 'none' | 'subtle' | 'muted' | 'accent';
  };
  children: Component[];
}

export interface SplitComponent extends BaseComponent {
  type: 'split';
  props?: {
    ratio?: '1:1' | '1:2' | '2:1' | '1:3' | '3:1' | '1:4' | '4:1';
    gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    vertical?: boolean; // Stack on mobile
    reversed?: boolean;
  };
  children: [Component, Component]; // Exactly 2 children
}

export interface SpacerComponent extends BaseComponent {
  type: 'spacer';
  props?: {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  };
}

export interface IllustrationComponent extends BaseComponent {
  type: 'illustration';
  props: {
    name?: 'empty-state' | 'success' | 'error' | 'search' | 'notification' | 'chart' | 'document' | 'settings' | 'user' | 'folder';
    svg?: string; // Raw SVG string
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: 'primary' | 'secondary' | 'muted';
  };
}

export interface CalloutComponent extends BaseComponent {
  type: 'callout';
  props: {
    title?: string;
    message: string;
    variant?: 'info' | 'success' | 'warning' | 'error' | 'tip' | 'note';
    icon?: string;
    collapsible?: boolean;
  };
  children?: Component[];
}

export interface StatComponent extends BaseComponent {
  type: 'stat';
  props: {
    label: string;
    value: string | number;
    change?: {
      value: string | number;
      type: 'increase' | 'decrease' | 'neutral';
    };
    icon?: string;
    description?: string;
  };
}

export interface AvatarComponent extends BaseComponent {
  type: 'avatar';
  props: {
    src?: string;
    name: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    status?: 'online' | 'offline' | 'busy' | 'away';
  };
}

export interface TagGroupComponent extends BaseComponent {
  type: 'tag-group';
  props: {
    tags: Array<{
      id: string;
      label: string;
      variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
      removable?: boolean;
    }>;
    size?: 'sm' | 'md';
  };
}

export type Component =
  | TextComponent
  | HeadingComponent
  | ButtonComponent
  | CardComponent
  | ListComponent
  | TableComponent
  | ChartComponent
  | FormComponent
  | InputComponent
  | SelectComponent
  | ImageComponent
  | AlertComponent
  | ProgressComponent
  | BadgeComponent
  | DividerComponent
  | ContainerComponent
  | IconComponent
  | StackComponent
  | SectionComponent
  | SplitComponent
  | SpacerComponent
  | IllustrationComponent
  | CalloutComponent
  | StatComponent
  | AvatarComponent
  | TagGroupComponent;

export interface GeneratedUI {
  components: Component[];
  metadata?: {
    title?: string;
    description?: string;
  };
}
