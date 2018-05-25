import uuid from 'uuid/v1'

export default {
  Mutation: {
    createNotification: async (_, { input }, { Notifications }) => {
      const id = uuid()
      await Notifications.insert(Object.assign(input, {
        id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }))
      return Notifications.findOne({ id })
    },
  },
  Query: {
    notifications: async (_, { filter }, { Notifications }) => {
      const totalCount = await Notifications.count({})
      const notifications = await Notifications
        .find(filter)
        .sort({ createdAt: -1 })
        .toArray()
      return {
        totalCount,
        notifications,
      }
    },
  },
}
