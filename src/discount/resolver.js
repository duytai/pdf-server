import uuid from 'uuid/v1'
import { filterToMongoQuery } from '../lib'

export default {
  Query: {
    discounts: async (_, { filter, skip, limit }, { Discounts }) => {
      const query = filterToMongoQuery(filter)
      const skipOp = skip >= 0 ? skip : 0
      const limitOp = limit >= 0 ? limit : 10
      const totalCount = Discounts.count(query)
      const discounts = Discounts
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skipOp)
        .limit(limitOp)
        .toArray()
      return {
        totalCount,
        discounts,
      }
    },
  },
  Mutation: {
    createDiscount: async (_, { input }, { Discounts }) => {
      const { code } = input
      if (await Discounts.findOne({ code })) throw new Error(`code ${code} is not avaliable`)
      const id = uuid()
      const discount = Object.assign(input, {
        id,
        isValid: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      await Discounts.insert(discount)
      return Discounts.findOne({ id })
    },
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
