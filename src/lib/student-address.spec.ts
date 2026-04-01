import { describe, it, expect } from 'vitest'

import { resolveStudentAddress } from './student-address'

const OWN_ADDRESS = {
  address_line_1: '10 Own Street',
  address_line_2: null,
  city: 'London',
  postcode: 'EC1A 1AA',
}

const GUARDIAN_ADDRESS = {
  address_line_1: '99 Guardian Road',
  address_line_2: 'Flat 2',
  city: 'Bristol',
  postcode: 'BS1 1AA',
}

describe('resolveStudentAddress', () => {
  it('returns own address fields when address_guardian is null', () => {
    const result = resolveStudentAddress({
      ...OWN_ADDRESS,
      address_guardian: null,
    })
    expect(result).toEqual(OWN_ADDRESS)
  })

  it('returns own address fields when address_guardian is undefined', () => {
    const result = resolveStudentAddress(OWN_ADDRESS)
    expect(result).toEqual(OWN_ADDRESS)
  })

  it('returns guardian address when address_guardian is set', () => {
    const result = resolveStudentAddress({
      ...OWN_ADDRESS,
      address_guardian: GUARDIAN_ADDRESS,
    })
    expect(result).toEqual(GUARDIAN_ADDRESS)
  })

  it('returns guardian address even when own address fields are null', () => {
    const result = resolveStudentAddress({
      address_line_1: null,
      address_line_2: null,
      city: null,
      postcode: null,
      address_guardian: GUARDIAN_ADDRESS,
    })
    expect(result).toEqual(GUARDIAN_ADDRESS)
  })

  it('returns nulls when both own and guardian are null', () => {
    const result = resolveStudentAddress({
      address_line_1: null,
      address_line_2: null,
      city: null,
      postcode: null,
      address_guardian: null,
    })
    expect(result).toEqual({
      address_line_1: null,
      address_line_2: null,
      city: null,
      postcode: null,
    })
  })
})
