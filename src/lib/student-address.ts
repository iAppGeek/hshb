export type AddressSource = {
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  postcode: string | null
}

export function resolveStudentAddress(student: {
  address_line_1: string | null
  address_line_2: string | null
  city: string | null
  postcode: string | null
  address_guardian?: AddressSource | null
}): AddressSource {
  if (student.address_guardian) return student.address_guardian
  return {
    address_line_1: student.address_line_1,
    address_line_2: student.address_line_2,
    city: student.city,
    postcode: student.postcode,
  }
}
