export const fetchStores = async () => {
  const response = await fetch("https://www.bauhaus.se/storelocator/api/stores/")
  const stores: { i: string, n: string }[] = await response.json()
  const stores_with_relevant_info = stores.map(({ i, n }) => ({ location_id: i, location_name: n }))
  return stores_with_relevant_info
}