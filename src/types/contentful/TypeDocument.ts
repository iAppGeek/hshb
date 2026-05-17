import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from 'contentful'

export interface TypeDocumentFields {
  name: EntryFieldTypes.Symbol
  files: EntryFieldTypes.Array<EntryFieldTypes.AssetLink>
}

export type TypeDocumentSkeleton = EntrySkeletonType<
  TypeDocumentFields,
  'document'
>
export type TypeDocument<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypeDocumentSkeleton, Modifiers, Locales>
