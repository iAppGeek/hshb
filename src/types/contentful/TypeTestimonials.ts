import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from 'contentful'

export interface TypeTestimonialsFields {
  title: EntryFieldTypes.Symbol
  text: EntryFieldTypes.Text
  author: EntryFieldTypes.Symbol
  role?: EntryFieldTypes.Symbol
  icon?: EntryFieldTypes.AssetLink
}

export type TypeTestimonialsSkeleton = EntrySkeletonType<
  TypeTestimonialsFields,
  'testimonials'
>
export type TypeTestimonials<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypeTestimonialsSkeleton, Modifiers, Locales>
