import * as repo from "./product.repository"

export const getProducts = async (
  search: string,
  page: number,
  limit: number
) => {

  return repo.findProducts(search, page, limit)

}

export const getProductById = async (id: number) => {

  return repo.findProductById(id)

}