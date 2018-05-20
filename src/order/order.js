export default `
  type Order {
    id: ID!
    createdAt: Float 
    updatedAt: Float
    delivery: Delivery!
    cartItems: [CartItem!]!
    services: [JSON!]!
  } 
  type CartItem {
    pages: [JSON!]!
    productConfig: JSON!
    quantity: Int!
  }
  type Delivery {
    address: String!
    district: String!
    email: String!
    name: String!
    note: String!
    phone: String!
    ward: String!
  }
  extend type Mutation {
    createOrder(meta: String!): Order 
    createPDF(orderId: ID!): Boolean
  }
  extend type Query {
    ordersByUser(ids: [ID!]): [Order!]!
  }
`
