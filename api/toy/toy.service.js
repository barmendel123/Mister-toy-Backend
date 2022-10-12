const { json } = require('express')
const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy) {
    var criteria
    try {
        console.log('FILTER BY:', filterBy);
        criteria = _buildCriteria(filterBy)

        const collection = await dbService.getCollection('toy')
        var toys = await collection.find(criteria).toArray()
        return toys
    } catch (err) {
        logger.error('cannot find toys', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.name) {
        const regex = new RegExp(filterBy.name, 'i')
        criteria.name = { $regex: regex }
    }

    if (filterBy.inStock === 'true') {
        criteria.inStock = true
    } else if (filterBy.inStock === 'false') {
        criteria.inStock = false
    }

    // if(filterBy.label) {
    //     criteria.labels = { $all: [label]}
    // }

    switch (filterBy.label) {
        case 'On wheels':
            criteria.labels = 'On wheels'
            break;
        case 'Box game':
            criteria.labels = 'Box game'
            break;
        case 'Art':
            criteria.labels = 'Art'
            break;
        case 'Baby':
            criteria.labels = 'Baby'
            break;

        case 'Doll':
            criteria.labels = 'Doll'
            break;
        case 'Puzzle':
            criteria.labels = 'Puzzle'
            break;
        case 'Outdoor ':
            criteria.labels = 'Outdoor'
            break;
        default:
            break;
    }
    console.log(criteria);
    return criteria
}

// const criteria = {}
// if (filterBy.txt) {
//     const regex = new RegExp(filterBy.txt, 'i')
//     criteria.fullName = {$regex : regex}
// }
// if (filterBy.minBalance) {
//     criteria.balance = { $gte: filterBy.minBalance }
// }

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        const toy = collection.findOne({ _id: ObjectId(toyId) })
        return toy
    } catch (err) {
        logger.error(`while finding toy ${toyId}`, err)
        throw err
    }
}

async function remove(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.deleteOne({ _id: ObjectId(toyId) })
        return toyId
    } catch (err) {
        logger.error(`cannot remove toy ${toyId}`, err)
        throw err
    }
}

async function add(toy) {
    try {
        const collection = await dbService.getCollection('toy')
        toy.createdAt = Date.now()
        toy.inStock = true
        toy.img = getRandomIntInclusive(1, 3)
        const addedToy = await collection.insertOne(toy)

        return addedToy
    } catch (err) {
        logger.error('cannot insert toy', err)
        throw err
    }
}
async function update(toy) {
    try {
        var id = ObjectId(toy._id)
        delete toy._id
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: id }, { $set: { ...toy } })
        return toy
    } catch (err) {
        logger.error(`cannot update toy ${toyId}`, err)
        throw err
    }
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

module.exports = {
    remove,
    query,
    getById,
    add,
    update,
}