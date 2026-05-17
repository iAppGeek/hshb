import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from 'contentful'

export interface TypeQuotesFields {
  title: EntryFieldTypes.Symbol
  text: EntryFieldTypes.Text
  author: EntryFieldTypes.Symbol
  role?: EntryFieldTypes.Symbol
  icon?: EntryFieldTypes.AssetLink
}

export type TypeQuotesSkeleton = EntrySkeletonType<TypeQuotesFields, 'quotes'>
export type TypeQuotes<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypeQuotesSkeleton, Modifiers, Locales>
