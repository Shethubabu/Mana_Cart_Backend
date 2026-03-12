import * as repo from "./product.repository"

export const getProducts = async (query: any) => {

  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 12

  return repo.findProducts({
    search: query.search,
    category: query.category,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    page,
    limit
  })

}

export const getProductById = async (id: number) => {

  return repo.findProductById(id)

}
export const getFeaturedProducts = () => {
  return repo.findFeaturedProducts()
}