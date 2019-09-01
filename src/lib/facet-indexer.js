export class FacetIndexer {
  constructor(options) {
    Object.assign(
      this,
      {
        allKeys: new Set(),
        facets: {}
      },
      options
    )
  }

  add(name, value, key) {
    const { allKeys, facets } = this

    let facet = facets[name]
    if (!facet) facet = facets[name] = {}

    let facetKeys = facet[value]
    if (!facetKeys) facetKeys = facet[value] = []
    facetKeys.push(key)

    allKeys.add(key)
  }

  query(query) {
    const { allKeys, facets } = this
    const unions = {}

    // Evaluate the query to produce a union of keys for each facet
    const names = Object.keys(facets)
    for (const name of names) {
      const facet = facets[name]
      const facetQuery = query[name]
      const union = []
      let active = false

      if (facetQuery) {
        const values = Object.keys(facet)
        for (const value of values) {
          if (facetQuery[value]) {
            union.push(...facet[value])
            active = true
          }
        }
      }

      if (active) unions[name] = union
    }

    const unionNames = Object.keys(unions)

    return new FacetResult({ allKeys, facets, names, unions, unionNames })
  }
}

export class FacetResult {
  constructor(options) {
    Object.assign(this, options)
  }

  counts() {
    const { facets, names, unions, unionNames } = this
    const counts = {}

    // Compute a count for each facet value
    for (const name of names) {
      const facet = facets[name]
      const facetCounts = (counts[name] = {})

      const values = Object.keys(facet)
      for (const value of values) {
        let facetKeys = facet[value]

        for (const unionName of unionNames) {
          if (name === unionName) continue

          const union = unions[unionName]
          facetKeys = facetKeys.filter(key => union.includes(key))
        }

        facetCounts[value] = facetKeys.length
      }
    }

    return counts
  }

  keys() {
    const { allKeys, unions, unionNames } = this
    let keys

    if (unionNames.length) {
      for (const unionName of unionNames) {
        const union = unions[unionName]
        keys = keys ? keys.filter(key => union.includes(key)) : union
      }
    } else {
      keys = [...allKeys]
    }

    return keys
  }
}
