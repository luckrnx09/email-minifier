import type { Sequence } from './sequence';

type SetAttributeAction = {
  action: 'set-attribute';
  name: string;
  value: string;
};

type RemoveAttributeAction = {
  action: 'remove-attribute';
  name: string;
};

type MinifyCSSSelectorAction = {
  action: 'minify-css-selector';
  originSelector: string;
  newSelector: string;
};

type MinifyStyleAction = {
  action: 'minify-style';
};

export type Task = {
  el: Element;
} & (
  | SetAttributeAction
  | RemoveAttributeAction
  | MinifyCSSSelectorAction
  | MinifyStyleAction
);

export type Context = {
  originalEmailBody: string;
  styles: string;
  document: Document;
  idSequence: Sequence;
  classSequence: Sequence;
  mapping: {
    ids: Map<string, string>;
    classes: Map<string, string>;
    dataSets: Map<string, string>;
  };
};

export type ComposeOption = {
  minifyIds?: boolean;
  minifyClasses?: boolean;
  removeUnusedAttrs?: false | Array<RegExp>;
  minifyDatasets?: boolean;
  minifyStyles?: boolean;
};

export type TaskType =
  | 'minify-ids'
  | 'minify-classes'
  | 'minify-dataset-attrs'
  | 'remove-unused-attrs'
  | 'minify-styles';
