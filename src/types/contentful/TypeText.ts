import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from 'contentful'

export interface TypeTextFields {
  id: EntryFieldTypes.Symbol
  text: EntryFieldTypes.Text
}

export type TypeTextSkeleton = EntrySkeletonType<TypeTextFields, 'text'>
export type TypeText<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypeTextSkeleton, Modifiers, Locales>
