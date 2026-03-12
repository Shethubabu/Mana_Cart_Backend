import * as repo from "./category.repository"

export const getCategories = () => {

  return repo.findCategories()

}