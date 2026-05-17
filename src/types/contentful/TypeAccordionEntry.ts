import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from 'contentful'

export interface TypeAccordionEntryFields {
  title: EntryFieldTypes.Symbol
  body: EntryFieldTypes.Text
}

export type TypeAccordionEntrySkeleton = EntrySkeletonType<
  TypeAccordionEntryFields,
  'accordionEntry'
>
export type TypeAccordionEntry<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypeAccordionEntrySkeleton, Modifiers, Locales>
