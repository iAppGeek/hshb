import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from 'contentful'

export interface TypePeopleFields {
  priorityOrder: EntryFieldTypes.Integer
  firstName: EntryFieldTypes.Symbol
  lastName: EntryFieldTypes.Symbol
  title?: EntryFieldTypes.Symbol<'Dr' | 'Miss' | 'Mr' | 'Mrs' | 'Ms'>
  blurb?: EntryFieldTypes.Symbol
  extendedBlurb?: EntryFieldTypes.Text
  role: EntryFieldTypes.Symbol<
    'Our Committee' | 'Our Teachers' | 'Senior Committee'
  >
  roleTag: EntryFieldTypes.Array<
    EntryFieldTypes.Symbol<
      | 'committee'
      | 'head'
      | 'parent'
      | 'senior-committee'
      | 'teacher'
      | 'volunteer'
    >
  >
  email?: EntryFieldTypes.Symbol
  photo?: EntryFieldTypes.AssetLink
  startDate?: EntryFieldTypes.Date
  largeView?: EntryFieldTypes.Boolean
}

export type TypePeopleSkeleton = EntrySkeletonType<TypePeopleFields, 'people'>
export type TypePeople<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode,
> = Entry<TypePeopleSkeleton, Modifiers, Locales>
