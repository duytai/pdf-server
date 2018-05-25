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
  extend type Mutation {
    discount(code: ID!, products: [ProductType!]!): Discount
  }
`
