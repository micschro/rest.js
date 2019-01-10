module.exports = paginate

const iterator = require('./iterator')

function paginate (octokit, route, options, mapFn) {
  if (typeof options === 'function') {
    mapFn = options
    options = undefined
  }
  options = octokit.request.endpoint.merge(route, options)
  return gather([], iterator(octokit, options)[Symbol.asyncIterator](), mapFn)
}

function gather (results, iterator, mapFn) {
  return iterator.next()
    .then(result => {
      if (result.done) {
        return results
      }

      let earlyExit = false
      function done () {
        earlyExit = true
      }

      const dataHolder = result.value ? result.value : result
      results = results.concat(mapFn ? mapFn(dataHolder, done) : dataHolder.data)

      if (earlyExit) {
        return results
      }

      return gather(results, iterator, mapFn)
    })
}
