export function companyName(company) {
  if (company) return company.full_name || company.name
}

export function thingTypeName(thingType) {
  if (thingType) {
    const companyName =
      (thingType.oem_company_lookup && thingType.oem_company_lookup.name) ||
      (thingType.reseller_company_lookup &&
        thingType.reseller_company_lookup.name)
    return companyName ? `${companyName} ${thingType.name}` : thingType.name
  }
}
