const getEnumValues = (EnumObj: any) => {
  const values: any = {}

  Object.keys(EnumObj)
  .forEach((key) => {
    values[key] = EnumObj[key as any]
  })

  return values
}

export default getEnumValues
