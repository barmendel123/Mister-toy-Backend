const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const {getToys, getToyById, addToy, updateToy, removeToy, addReview } = require('./toy.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', getToys)
router.get('/:id', getToyById)
// router.post('/', addToy)
router.post('/', requireAuth, addToy)
// router.put('/:id', updateToy)
router.put('/:id', requireAuth, updateToy)
// router.delete('/:id', removeToy)
router.delete('/:id', requireAuth, requireAdmin, removeToy)

module.exports = router