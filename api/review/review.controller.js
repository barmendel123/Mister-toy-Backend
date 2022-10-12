const logger = require('../../services/logger.service')
const userService = require('../user/user.service')
const authService = require('../auth/auth.service')
const toyService = require('../toy/toy.service')
const socketService = require('../../services/socket.service')

const reviewService = require('./review.service')

// async function getReviews(req, res) {
//     try {
//         const reviews = await reviewService.query(req.query)
//         console.log('reviews===>', reviews);
//         res.send(reviews)
//     } catch (err) {
//         logger.error('Cannot get reviews', err)
//         res.status(500).send({ err: 'Failed to get reviews' })
//     }
// }
async function getReviews(req, res) {
    try {
        const filterBy = req.query
        const reviews = await reviewService.query(filterBy)
        res.send(reviews)
    } catch (err) {
        logger.error('Cannot get reviews', err)
        res.status(500).send({ err: 'Failed to get reviews' })
    }
}

async function deleteReview(req, res) {
    try {
        const deletedCount = await reviewService.remove(req.params.id)
        if (deletedCount === 1) {
            res.send({ msg: 'Deleted successfully' })
        } else {
            res.status(400).send({ err: 'Cannot remove review' })
        }
    } catch (err) {
        logger.error('Failed to delete review', err)
        res.status(500).send({ err: 'Failed to delete review' })
    }
}


async function addReview(req, res) {
 
    try {
        var review = req.body
        review = await reviewService.add(review)
        
        // prepare the updated review for sending out
        review.user = await userService.getById(review.userId)
        review.toy = await toyService.getById(review.toyId)

        delete review.userId
        delete review.toyId

        // socketService.broadcast({type: 'review-added', data: review, userId: loggedinUser._id})
        // socketService.emitToUser({type: 'review-about-you', data: review, userId: review.aboutUserId})
        
        // const fullUser = await userService.getById(loggedinUser._id)
        // socketService.emitTo({type: 'user-updated', data: fullUser, label: fullUser._id})

        res.send(review)

    } catch (err) {
        logger.error('Failed to add review', err)
        res.status(500).send({ err: 'Failed to add review' })
    }
}

module.exports = {
    getReviews,
    deleteReview,
    addReview
}