import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from 'contentful'

export interface TypeDocShareFields {
  name?: EntryFieldTypes.Symbol
  document?: EntryFieldTypes.AssetLink
}

export type TypeDocShareSkeleton = EntrySkeletonType<
  TypeDocShareFields,
  'docShare'
>
export type TypeDocShare<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypeDocShareSkeleton, Modifiers, Locales>
