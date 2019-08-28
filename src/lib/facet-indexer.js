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

  apply(query) {
    const { facets } = this
    const counts = {}
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

    let keys
    if (unionNames.length) {
      for (const unionName of unionNames) {
        const union = unions[unionName]
        keys = keys ? keys.filter(key => union.includes(key)) : union
      }
    } else {
      keys = [...this.allKeys]
    }

    return { counts, keys, total: keys.length }
  }
}
