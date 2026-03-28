import { describe, it, expect } from 'vitest'

import { getUserFriendlyDbError } from './db-error'

const FALLBACK = 'Something went wrong. Please try again.'

describe('getUserFriendlyDbError', () => {
  describe('23505 — unique_violation', () => {
    it('extracts column name from detail string', () => {
      const err = {
        code: '23505',
        message: 'duplicate key value violates unique constraint',
        details: 'Key (email)=(test@example.com) already exists.',
      }
      expect(getUserFriendlyDbError(err, FALLBACK)).toBe(
        'A record with this email already exists.',
      )
    })

    it('replaces underscores with spaces in column name', () => {
      const err = {
        code: '23505',
        message: 'duplicate key value violates unique constraint',
        details: 'Key (student_code)=(ABC123) already exists.',
      }
      expect(getUserFriendlyDbError(err, FALLBACK)).toBe(
        'A record with this student code already exists.',
      )
    })

    it('returns generic message when details is missing', () => {
      const err = {
        code: '23505',
        message: 'duplicate key value violates unique constraint',
      }
      expect(getUserFriendlyDbError(err, FALLBACK)).toBe(
        'A record with this value already exists.',
      )
    })
  })

  describe('23503 — foreign_key_violation', () => {
    it('returns foreign key message', () => {
      const err = {
        code: '23503',
        message: 'insert or update violates foreign key constraint',
      }
      expect(getUserFriendlyDbError(err, FALLBACK)).toBe(
        'This record is linked to other data and cannot be changed this way.',
      )
    })
  })

  describe('23502 — not_null_violation', () => {
    it('returns not-null message', () => {
      const err = {
        code: '23502',
        message: 'null value in column violates not-null constraint',
      }
      expect(getUserFriendlyDbError(err, FALLBACK)).toBe(
        'A required field is missing.',
      )
    })
  })

  describe('23514 — check_constraint_violation', () => {
    it('returns check constraint message', () => {
      const err = {
        code: '23514',
        message: 'new row violates check constraint',
      }
      expect(getUserFriendlyDbError(err, FALLBACK)).toBe(
        'A value does not meet the required conditions.',
      )
    })
  })

  describe('unknown or non-DB errors', () => {
    it('returns fallback for unknown error code', () => {
      const err = { code: '42P01', message: 'relation does not exist' }
      expect(getUserFriendlyDbError(err, FALLBACK)).toBe(FALLBACK)
    })

    it('returns fallback for a string error', () => {
      expect(getUserFriendlyDbError('something broke', FALLBACK)).toBe(FALLBACK)
    })

    it('returns fallback for null', () => {
      expect(getUserFriendlyDbError(null, FALLBACK)).toBe(FALLBACK)
    })

    it('returns fallback for undefined', () => {
      expect(getUserFriendlyDbError(undefined, FALLBACK)).toBe(FALLBACK)
    })

    it('returns fallback for object without code property', () => {
      const err = { message: 'some error' }
      expect(getUserFriendlyDbError(err, FALLBACK)).toBe(FALLBACK)
    })
  })
})
