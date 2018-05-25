export default {
  Mutation: {
    discount: async (_, { code, products }, { Discounts, Orders }) => {
      const discount = await Discounts.findOne({
        code,
        products: {
          $all: products,
        },
      })
      if (!discount) return null
      const {
        isValid,
        beginAt,
        endAt,
        totalCount,
        id,
      } = discount
      if (!isValid) return null
      if (Date.now() < beginAt) return null
      if (Date.now() > endAt) return null
      const usedCount = await Orders.count({ 'discount.id': id })
      if (usedCount >= totalCount) return null
      return discount
    },
  },
}
