export default `
  enum ProductType {
    PHOTO_BOOK
    PHOTO_CARD
    FRAME
    CALENDAR
    INVITATION
  }
  type Discount {
    id: ID!
    code: ID!
    percent: Float!
    amount: Int!
    products: [ProductType!]!
    totalCount: Int! 
    beginAt: Float!
    endAt: Float!
    isValid: Boolean!
    createdAt: Float!
    updatedAt: Float!
  }
  type DiscountConnection {
    totalCount: Int!
    discounts: [Discount!]!
  }
  extend type Query {
    discounts(filter: DiscountFilter!, skip: Int, limit: Int): DiscountConnection!
  }
  extend type Mutation {
    discount(code: ID!, products: [ProductType!]!): Discount
    createDiscount(input: DiscountInput!): Discount
    updateDiscount(input: UpdateDiscountInput!): Discount
  }
`
