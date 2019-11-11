import getEnumValues from '@shared/helpers/getEnumValues'

describe('getEnumValues', () => {
  it('should be a function', () => {
    expect(getEnumValues).toBeInstanceOf(Function)
  })

  it('should return the values of the passed emum', () => {
    enum TestEnum {
      Value1 = 'Value1',
      Value2 = 'Value2'
    }

    expect(getEnumValues(TestEnum)).toEqual({ Value1: 'Value1', Value2: 'Value2' })
  })
})
