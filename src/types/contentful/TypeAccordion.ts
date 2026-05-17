import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from 'contentful'
import type { TypeAccordionEntrySkeleton } from './TypeAccordionEntry'

export interface TypeAccordionFields {
  name: EntryFieldTypes.Symbol
  entries: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<TypeAccordionEntrySkeleton>
  >
}

export type TypeAccordionSkeleton = EntrySkeletonType<
  TypeAccordionFields,
  'accordion'
>
export type TypeAccordion<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypeAccordionSkeleton, Modifiers, Locales>
