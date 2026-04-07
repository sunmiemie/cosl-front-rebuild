import { request } from "@/utils/service"
import type * as QuestionItem from "./types/question-item"

// FirstLevelDirectory

/** 查 */
export function getFirstLevelDirectoryApi(params: QuestionItem.GetFirstLevelDirectoryRequestData) {
  return request<QuestionItem.GetFirstLevelDirectoryResponseData>({
    url: "data/question-item-first-level-directory/list",
    method: "get",
    params
  })
}

export function createFirstLevelDirectoryApi(data: QuestionItem.CreateFirstLevelDirectoryRequestData) {
  return request<QuestionItem.CreateFirstLevelDirectoryResponseData>({
    url: "data/question-item-first-level-directory/add",
    method: "post",
    data
  })
}

// SecondLevelDirectory

export function createSecondLevelDirectoryApi(data: QuestionItem.CreateSecondLevelDirectoryRequestData) {
  return request({
    url: "data/question-item-second-level-directory/add",
    method: "post",
    data
  })
}

// Directory

/** 查 */
export function getDirectoryApi(params: QuestionItem.GetDirectoryRequestData) {
  return request<QuestionItem.GetDirectoryResponseData>({
    url: "data/question-item-directory/list",
    method: "get",
    params
  })
}

// QuestionItem

/** 查 */
export function getQuestionItemApi(params: QuestionItem.GetQuestionItemRequestData) {
  return request<QuestionItem.GetQuestionItemResponseData>({
    url: "data/question-item/list",
    method: "get",
    params
  })
}

export function createQuestionItemApi(data: QuestionItem.CreateQuestionItemRequestData) {
  return request({
    url: "data/question-item/add",
    method: "post",
    data
  })
}

/** 改 */
export function updateQuestionItemApi(data: QuestionItem.UpdateQuestionItemRequestData) {
  return request({
    url: "data/question-item/update",
    method: "post",
    data
  })
}
