import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from 'contentful'

export interface TypeEventsFields {
  name: EntryFieldTypes.Symbol
  date: EntryFieldTypes.Date
  description: EntryFieldTypes.Symbol
  media?: EntryFieldTypes.Array<EntryFieldTypes.AssetLink>
}

export type TypeEventsSkeleton = EntrySkeletonType<TypeEventsFields, 'events'>
export type TypeEvents<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypeEventsSkeleton, Modifiers, Locales>
