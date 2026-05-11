import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"
import { type RouteRecordRaw } from "vue-router"
import { constantRoutes, dynamicRoutes } from "@/router"
import { flatMultiLevelRoutes } from "@/router/helper"
import routeSettings from "@/config/route"

const hasPermission = (roles: string[], permissionCodes: string[], route: RouteRecordRaw) => {
  const routeRoles = route.meta?.roles
  const routePermissions = route.meta?.permissions
  const roleMatched = routeRoles ? roles.some((role) => routeRoles.includes(role)) : false
  const permissionMatched = routePermissions
    ? permissionCodes.some((permissionCode) => routePermissions.includes(permissionCode))
    : false
  if (routeRoles?.length || routePermissions?.length) return roleMatched || permissionMatched
  return true
}

const resolveChildPath = (parentPath: string, childPath: string) => {
  if (childPath.startsWith("/")) return childPath
  return `${parentPath.replace(/\/$/, "")}/${childPath}`.replace(/\/{2,}/g, "/")
}

const resolveFirstAccessibleChildPath = (route: RouteRecordRaw) => {
  const firstAccessibleChild = route.children?.find((child) => !child.meta?.hidden)
  if (!firstAccessibleChild) return undefined
  return resolveChildPath(route.path, firstAccessibleChild.path)
}

const filterDynamicRoutes = (routes: RouteRecordRaw[], roles: string[], permissionCodes: string[]) => {
  const res: RouteRecordRaw[] = []
  routes.forEach((route) => {
    const tempRoute = { ...route }
    if (hasPermission(roles, permissionCodes, tempRoute)) {
      if (tempRoute.children) {
        tempRoute.children = filterDynamicRoutes(tempRoute.children, roles, permissionCodes)
        if (route.children?.length && tempRoute.children.length === 0 && !tempRoute.meta?.alwaysShow) return
        if (tempRoute.path === "/permission") {
          const firstAccessibleChildPath = resolveFirstAccessibleChildPath(tempRoute)
          if (firstAccessibleChildPath) tempRoute.redirect = firstAccessibleChildPath
        }
      }
      res.push(tempRoute)
    }
  })
  return res
}

export const usePermissionStore = defineStore("permission", () => {
  /** 可访问的路由 */
  const routes = ref<RouteRecordRaw[]>([])
  /** 有访问权限的动态路由 */
  const addRoutes = ref<RouteRecordRaw[]>([])

  /** 根据角色生成可访问的 Routes（可访问的路由 = 常驻路由 + 有访问权限的动态路由） */
  const setRoutes = (roles: string[], permissionCodes: string[] = []) => {
    const accessedRoutes = filterDynamicRoutes(dynamicRoutes, roles, permissionCodes)
    _set(accessedRoutes)
  }

  /** 所有路由 = 所有常驻路由 + 所有动态路由 */
  const setAllRoutes = () => {
    _set(dynamicRoutes)
  }

  const _set = (accessedRoutes: RouteRecordRaw[]) => {
    routes.value = constantRoutes.concat(accessedRoutes)
    addRoutes.value = routeSettings.thirdLevelRouteCache ? flatMultiLevelRoutes(accessedRoutes) : accessedRoutes
  }

  return { routes, addRoutes, setRoutes, setAllRoutes }
})

/** 在 setup 外使用 */
export function usePermissionStoreHook() {
  return usePermissionStore(store)
}
