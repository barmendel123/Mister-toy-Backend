const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')


async function query(filterBy = {}) {
  try {
      const criteria = _buildCriteria(filterBy)
      const collection = await dbService.getCollection('review')
      // const reviews = await collection.find(criteria).toArray()
      var reviews = await collection.aggregate([
          {
              $match: criteria
          },
          {
              $lookup:
              {
                  localField: 'userId',
                  from: 'user',
                  foreignField: '_id',
                  as: 'user'
              }
          },
          {
              $unwind: '$user'
          },
          {
              $lookup:
              {
                  localField: 'toyId',
                  from: 'toy',
                  foreignField: '_id',
                  as: 'toy'
              }
          },
          {
              $unwind: '$toy'
          }
      ]).toArray()
      reviews = reviews.map(review => {
          review.user = { _id: review.user._id, fullname: review.user.fullname }
          review.toy = { _id: review.toy._id, name: review.toy.name, price: review.toy.price  }
          review.createdAt = ObjectId(review._id).getTimestamp()
          delete review.userId
          delete review.toyId
          return review
      })
      return reviews
  } catch (err) {
      logger.error('cannot find reviews', err)
      throw err
  }

}

async function remove(reviewId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { loggedinUser } = store
        console.log('loggedinUser', loggedinUser);
        const collection = await dbService.getCollection('review')
        // remove only if user is owner/admin
        const criteria = { _id: ObjectId(reviewId) }
        if (!loggedinUser.isAdmin) criteria.byUserId = ObjectId(loggedinUser._id)
        const {deletedCount} = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove review ${reviewId}`, err)
        throw err                
    }
}


async function add(review) {
  try {
      const reviewToAdd = {
          toyId: ObjectId(review.toyId),
          userId: ObjectId(review.userId),
          content: review.content
      }
      const collection = await dbService.getCollection('review')
      await collection.insertOne(reviewToAdd)
      return reviewToAdd
  } catch (err) {
      logger.error('cannot insert review', err)
      throw err
  }
}

function _buildCriteria(filterBy) {
  const criteria = {}
  if (filterBy.byUserId) criteria.byUserId = ObjectId(filterBy.byUserId) 
  if (filterBy.toyId) criteria.toyId = ObjectId(filterBy.byUserId)
  return criteria
}

module.exports = {
    query,
    remove,
    add
}


