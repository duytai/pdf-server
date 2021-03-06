import bodyParser from 'body-parser'
import cors from 'cors'
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express'
import { makeExecutableSchema } from 'graphql-tools'
import { merge } from 'lodash'
import { MongoClient } from 'mongodb'
import express from 'express'
import GraphQLJSON from 'graphql-type-json'
import fileUpload from 'express-fileupload'
import path from 'path'
import { exec } from 'child_process'
import fs from 'fs'
import { createServer } from 'http'
import { request } from 'graphql-request'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { execute, subscribe } from 'graphql'
import { Order, OrderResolver, OrderInput } from './order'
import { Discount, DiscountResolver, DiscountInput } from './discount'
import { Notification, NotificationResolver } from './notification'

(async () => {
  const { SETTINGS } = process.env
  const { MONGO_URL, PORT = 4000 } = JSON.parse(SETTINGS)
  const db = await MongoClient.connect(MONGO_URL)
  const Empty = `
    scalar JSON
    type Query { _: Boolean }
    type Mutation { _: Boolean }
    type Subscription { _: Boolean }
  `
  const app = express()
  const schema = makeExecutableSchema({
    typeDefs: [
      Empty,
      Order,
      OrderInput,
      Discount,
      DiscountInput,
      Notification,
    ],
    resolvers: merge(OrderResolver, DiscountResolver, NotificationResolver, { JSON: GraphQLJSON }),
  })
  app.use(cors())
  app.use(fileUpload())
  app.use('/products', express.static('products'))
  app.post('/upload', (req, res) => {
    if (!req.files) return res.status(400).send('No files were uploaded')
    const { name } = req.files.order
    const orderId = name.replace('.zip', '')
    const orderPath = path.join(__dirname, `../orders/${orderId}.zip`)
    const orderFolder = path.join(__dirname, `../orders/${orderId}`)
    req.files.order.mv(orderPath, (error) => {
      if (error) return res.send(error.message)
      exec(`unzip ${orderPath} -d ${orderFolder}`, () => {
        fs.unlink(orderPath, () => console.log(`Remove ${orderPath}`))
        const createPDF = `
          mutation {
            createPDF(orderId: "${orderId}")
          }
        `
        request(`http://localhost:${PORT}/graphql`, createPDF)
      })
      return res.send('File uploaded')
    })
  })
  app.use('/graphql', bodyParser.json(), graphqlExpress({
    schema,
    context: {
      Orders: db.collection('orders'),
      Discounts: db.collection('discounts'),
      Notifications: db.collection('notifications'),
    },
  }))
  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: `ws://localhost:${PORT}/subscription`,
  }))
  const server = createServer(app)
  SubscriptionServer.create({
    schema,
    execute,
    subscribe,
  }, {
    server,
    graphql: '/subscription',
  })
  server.listen(PORT, () => {
    console.log(`🚀 Server ready at port ${PORT}`)
  })
})()
