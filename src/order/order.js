export default `
  enum OrderStatus {
    NEW
    ORDERED
    PAIDED
    PRINTED
    DELIVERED
    DONE
  }
  type Order {
    id: ID!
    createdAt: Float 
    updatedAt: Float
    delivery: Delivery!
    cartItems: [CartItem!]!
    services: [JSON!]!
    status: OrderStatus! 
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
    createPDF(orderId: ID!): Boolean!
    changeOrderStatus(orderId: ID!, status: OrderStatus!): Boolean!
  }
  extend type Query {
    ordersByUser(ids: [ID!]): [Order!]!
  }
  extend type Subscription {
    orderStatusChanged(orderId: ID!): Order
  }
`
