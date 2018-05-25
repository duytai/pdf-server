export default `
  enum NotificationStatus {
    CLOSE
    ONGOING
  }
  type Notification {
    id: ID!
    iconURL: String!
    title: String!
    imageURL: String!
    message: String!
    status: NotificationStatus!
  }
  type NotificationConnection {
    totalCount: Int!
    notifications: [Notification!]!
  }
  input NotificationFilter {
    id: ID
  }
  input NotificationInput {
    iconURL: String!
    imageURL: String!
    message: String!
    status: NotificationStatus!
    title: String!
  }
  extend type Query {
    notifications(filter: NotificationFilter): NotificationConnection!
  }
  extend type Mutation {
    createNotification(input: NotificationInput): Notification
  }
`
