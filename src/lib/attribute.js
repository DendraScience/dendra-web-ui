export function attributeData({
  booleanValue,
  target,
  textValue,
  textValue2,
  type,
  unitTag
}) {
  let data

  if (target === 'object') {
    data = {}
    if (type === 'delta' || type === 'range') {
      data[type] = [parseFloat(textValue), parseFloat(textValue2)]
    } else if (type === 'value') {
      data[type] = parseFloat(textValue)
    }
    if (unitTag) data.unit_tag = unitTag
  } else if (target === 'value') {
    if (type === 'boolean') {
      data = booleanValue
    } else if (type === 'number') {
      data = parseFloat(textValue)
    } else {
      data = textValue
    }
  }

  return data
}
