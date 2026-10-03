import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from 'contentful'

export interface TypePolicyFields {
  title: EntryFieldTypes.Symbol
  slug: EntryFieldTypes.Symbol
  summary: EntryFieldTypes.Symbol
  version: EntryFieldTypes.Symbol
  publishDate: EntryFieldTypes.Date
  pdf: EntryFieldTypes.AssetLink
}

export type TypePolicySkeleton = EntrySkeletonType<TypePolicyFields, 'policy'>
export type TypePolicy<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypePolicySkeleton, Modifiers, Locales>
