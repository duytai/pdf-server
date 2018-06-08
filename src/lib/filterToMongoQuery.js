export default (filter = {}) => {
  const query = {
    $and: [],
  }
  Object.entries(filter).forEach(([key, value]) => {
    const [fieldName, op] = key.split('_')
    switch (op) {
      case 'startsWith':
        query.$and.push({
          [fieldName]: {
            $regex: new RegExp(`^${value}`, 'gi'),
          },
        })
        break
      default:
        query.$and.push({
          [fieldName]: value,
        })
        break
    }
  })
  return query
}
