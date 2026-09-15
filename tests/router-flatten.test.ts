import { expect, it } from "vitest"
import { flatMultiLevelRoutes } from "@/router/helper"
import type { RouteRecordRaw } from "vue-router"
it("多级路由降级不重复直接子节点，匿名路由按完整路径匹配", () => {
  const routes: RouteRecordRaw[] = [
    {
      path: "/root",
      name: "root",
      component: {},
      children: [
        {
          path: "section",
          name: "section",
          component: {},
          children: [{ path: "detail", name: "detail", component: {} }]
        },
        { path: "other", component: {}, children: [{ path: "leaf", component: {} }] }
      ]
    }
  ]
  const flattened = flatMultiLevelRoutes(routes)[0].children!
  expect(flattened.map((item) => item.path)).toEqual([
    "/root/section",
    "/root/section/detail",
    "/root/other",
    "/root/other/leaf"
  ])
  expect(flattened.every((item) => !item.children)).toBe(true)
  expect(routes[0].children).toHaveLength(2)
  expect(routes[0].children![0].children).toHaveLength(1)
})
