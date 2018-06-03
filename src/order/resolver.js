import uuid from 'uuid/v1'
import path from 'path'
import PDFDocument from 'pdfkit'
import im from 'imagemagick'
import Q from 'q'
import fs from 'fs-extra'
import { last } from 'lodash'
import { withFilter } from 'graphql-subscriptions'
import pubSub from '../pubSub'

const ORDER_CHANGED = 'orderChanged'

export default {
  Subscription: {
    orderChanged: {
      subscribe: withFilter(
        () => pubSub.asyncIterator(ORDER_CHANGED),
        ({ orderChanged: { id } }, { id: orderId }) => id === orderId,
      ),
    },
  },
  Mutation: {
    changeOrderStatus: async (_, { orderId, status }, { Orders }) => {
      const order = await Orders.findOne({ id: orderId })
      if (!order) throw new Error(`order ${orderId} is not found`)
      await Orders.update({ id: orderId }, { $set: { status, updatedAt: Date.now() } })
      if (status !== order.status) {
        order.status = status
        pubSub.publish(ORDER_CHANGED, { orderChanged: order })
      }
      return Orders.findOne({ id: orderId })
    },
    createPDF: async (_, { orderId }, { Orders }) => {
      const order = await Orders.findOne({ id: orderId })
      if (!order) throw new Error(`order ${orderId} is not found`)
      const inputFolder = path.resolve(__dirname, `../../orders/${orderId}/`)
      const outputFolder = path.resolve(__dirname, '../../products')
      if (!fs.existsSync(inputFolder)) throw new Error('Images have been uploaded yet')
      for (let oIndex = 0; oIndex < order.cartItems.length; oIndex += 1) {
        const cart = order.cartItems[oIndex]
        const outPdf = path.resolve(outputFolder, `${orderId}_${oIndex}.pdf`)
        const { pages } = cart
        const doc = new PDFDocument({
          autoFirstPage: false,
        })
        doc.pipe(fs.createWriteStream(outPdf))
        const PAGE_UNIT = 297
        for (let i = 0; i < pages.length; i += 1) {
          const { images, size, texts } = pages[i]
          const [widthPercent, heightPercent] = size
          doc.addPage({
            size: [
              widthPercent * PAGE_UNIT,
              heightPercent * PAGE_UNIT,
            ],
          })
          for (let j = 0; j < images.length; j += 1) {
            const {
              source: { uri },
              top,
              left,
              width,
              height,
            } = images[j]
            const imageName = last(uri.split('/'))
            const sourceImg = path.resolve(inputFolder, imageName)
            const desImg = `${sourceImg}.resized.${i}.${j}`
            const IMAGE_UNIT = 2048
            await Q.nfcall(im.convert, [
              sourceImg,
              '-thumbnail',
              `${IMAGE_UNIT * width}x${IMAGE_UNIT * height}^`,
              '-gravity',
              'center',
              '-extent',
              `${IMAGE_UNIT * width}x${IMAGE_UNIT * height}`,
              desImg,
            ])
            doc.image(desImg, left * PAGE_UNIT, top * PAGE_UNIT, {
              fit: [width * PAGE_UNIT, height * PAGE_UNIT],
            })
          }
          for (let j = 0; j < texts.length; j += 1) {
            const {
              top,
              left,
              width,
              align,
              color,
              text,
              size: textSize,
              font,
            } = texts[j]
            if (text) {
              doc
                .fillColor(color)
                .font(font)
                .fontSize(textSize)
                .text(text, left * PAGE_UNIT, top * PAGE_UNIT, {
                  width: width * PAGE_UNIT,
                  align,
                })
            }
          }
        }
        doc.end()
      }
      fs.remove(inputFolder)
      return true
    },
    createOrder: async (_, { meta }, { Orders }) => {
      const {
        cartItems,
        delivery,
        services,
        discount,
      } = JSON.parse(meta)
      const id = uuid()
      await Orders.insert({
        id,
        cartItems,
        delivery,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        services,
        status: 'NEW',
        discount,
      })
      return Orders.findOne({ id })
    },
  },
  Query: {
    ordersByUser: async (_, { ids }, { Orders }) => {
      return Orders.find({ 'services.id': { $in: ids } })
        .sort({ createdAt: -1 })
        .toArray()
    },
    orders: async (_, { filter, skip, limit }, { Orders }) => {
      const query = {}
      const skipOp = skip >= 0 ? skip : 0
      const limitOp = limit >= 0 ? limit : 10
      const { id_startsWith } = filter
      if (id_startsWith) {
        query.id = {
          $regex: new RegExp(`^${id_startsWith}`, 'gi')
        }
      }
      const totalCount = Orders.count(query)
      const orders = Orders
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skipOp)
        .limit(limitOp)
        .toArray()
      return {
        totalCount,
        orders,
      }
    },
  },
}
