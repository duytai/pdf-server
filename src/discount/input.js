export default `
  input DiscountFilter {
    code_startsWith: ID!
  }
  input UpdateDiscountInput {
    id: ID!
    isValid: Boolean
  }
  input DiscountInput {
    code: ID!
    percent: Float!
    amount: Int!
    products: [ProductType!]!
    totalCount: Int! 
    beginAt: Float!
    endAt: Float!
  }
`
