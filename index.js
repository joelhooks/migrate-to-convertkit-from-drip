const _ = require('lodash')
const fs = require('fs')
const csv = require('csv-parser')
const writer = require('fast-csv')

const csvFilePath = './subscribers.csv'
const tagSep = ','
const filterFor = '' // only looking for tags with a specific string
const filesToBuild = {}

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', function(row) {
    row.tags = _.filter(row.tags.split(tagSep), tag => tag.includes(filterFor))
    row.tags.forEach(tag => {
      const {email} = row
      const trimmedTag = _.trim(tag)
      //each tag will get its own csv output, so add it to the hash
      filesToBuild[trimmedTag] = filesToBuild[trimmedTag] || []
      filesToBuild[trimmedTag].push({email})
    })
  })
  .on('end', function() {
    _.keys(filesToBuild).forEach(key => {
      //go through all the filtered tags and write a csv file with the appropriate rows
      writer
        .writeToPath(`./${key}.csv`, filesToBuild[key], {headers: true})
        .on('finish', function() {
          console.log(`wrote ${key}.csv`)
        })
    })
  })
