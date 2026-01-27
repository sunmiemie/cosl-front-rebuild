import { type RouteRecordRaw, createRouter } from "vue-router"
import { history, flatMultiLevelRoutes } from "./helper"
import routeSettings from "@/config/route"

const Layouts = () => import("@/layouts/index.vue")

/**
 * 常驻路由
 * 除了 redirect/403/404/login 等隐藏页面，其他页面建议设置 Name 属性
 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layouts,
    meta: {
      hidden: true
    },
    children: [
      {
        path: ":path(.*)",
        component: () => import("@/views/redirect/index.vue")
      }
    ]
  },
  {
    path: "/403",
    component: () => import("@/views/error-page/403.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/404",
    component: () => import("@/views/error-page/404.vue"),
    meta: {
      hidden: true
    },
    alias: "/:pathMatch(.*)*"
  },
  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      hidden: true
    }
  },
  {
    path: "/",
    component: Layouts,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        name: "Dashboard",
        meta: {
          title: "首页",
          svgIcon: "dashboard",
          affix: true
        }
      }
    ]
  },
  {
    path: "/devicemanage",
    component: Layouts,
    redirect: "/devicemanage/device",
    meta: {
      title: "测试装备管理",
      elIcon: "Box"
    },
    children: [
      {
        path: "device",
        component: () => import("@/views/devicemanage/device/index.vue"),
        name: "Device",
        meta: {
          title: "装备管理",
          keepAlive: true
        },
        children: [
          {
            path: "boards",
            component: () => import("@/views/devicemanage/device/boards/index.vue"),
            name: "Boards",
            meta: {
              title: "电路板管理",
              keepAlive: true
            }
          },
          {
            path: "fixtures",
            component: () => import("@/views/devicemanage/device/fixtures/index.vue"),
            name: "Fixtures",
            meta: {
              title: "夹具管理",
              keepAlive: true
            }
          },
          {
            path: "psi",
            component: () => import("@/views/devicemanage/device/psi/index.vue"),
            name: "PSI",
            meta: {
              title: "主机管理",
              keepAlive: true
              // hidden: true
            }
          },
          {
            path: "equipments",
            component: () => import("@/views/devicemanage/device/equipments/index.vue"),
            name: "Equipments",
            meta: {
              title: "其他设备管理",
              keepAlive: true
            }
          }
        ]
      },
      {
        path: "devicemodel",
        component: () => import("@/views/devicemanage/devicemodel/index.vue"),
        name: "DeviceModel",
        meta: {
          title: "装备型号管理",
          keepAlive: true
        },
        children: [
          {
            path: "boardmodel",
            component: () => import("@/views/devicemanage/devicemodel/boardmodel/index.vue"),
            name: "BoardModel",
            meta: {
              title: "电路板型号管理",
              keepAlive: true
            }
          },
          {
            path: "fixturemodel",
            component: () => import("@/views/devicemanage/devicemodel/fixturemodel/index.vue"),
            name: "FixtureModel",
            meta: {
              title: "夹具型号管理",
              keepAlive: true
            }
          },
          {
            path: "psimodel",
            component: () => import("@/views/devicemanage/devicemodel/psimodel/index.vue"),
            name: "PSIModel",
            meta: {
              title: "主机型号管理",
              keepAlive: true
              // hidden: true
            }
          },
          {
            path: "equipmenttype",
            component: () => import("@/views/devicemanage/devicemodel/equipmenttype/index.vue"),
            name: "EquipmentType",
            meta: {
              // title: "其他设备类型管理",
              title: "其他设备型号管理",
              keepAlive: true
            }
          }
        ]
      },
      {
        path: "deviceFault",
        component: () => import("@/views/devicemanage/deviceFault/index.vue"),
        name: "DeviceFault",
        meta: {
          title: "设备故障管理",
          keepAlive: true,
          hidden: true
        }
      },
      {
        path: "instrumentDevice",
        component: () => import("@/views/devicemanage/instrumentDevice/index.vue"),
        name: "InstrumentDevice",
        meta: {
          title: "仪器管理",
          keepAlive: true
        }
      },
      {
        path: "product",
        component: () => import("@/views/devicemanage/product/index.vue"),
        name: "Product",
        meta: {
          title: "产品管理",
          keepAlive: true
        }
      }
    ]
  },
  {
    path: "/exceptionmanage",
    component: Layouts,
    redirect: "/exception/l-nitrogen",
    name: "ExceptionManage",
    meta: {
      title: "日常管理",
      elIcon: "Warning",
      alwaysShow: true,
      hidden: true
    },
    children: [
      {
        path: "l-everytest",
        component: () => import("@/views/exceptionmanage/everydayTest/index.vue"),
        name: "LEveryTest",
        meta: {
          elIcon: "Menu",
          title: "每日巡检"
        }
      },
      {
        path: "l-nitrogen",
        component: () => import("@/views/exceptionmanage/l-nitrogen/index.vue"),
        name: "L-Nitrogen",
        meta: {
          elIcon: "Menu",
          title: "液氮泄漏监测"
        }
      }
    ]
  }
]

/**
 * 动态路由
 * 用来放置有权限 (Roles 属性) 的路由
 * 必须带有 Name 属性
 */
export const dynamicRoutes: RouteRecordRaw[] = [
  {
    path: "/testmanage",
    component: Layouts,
    redirect: "/testmanage/testorder",
    meta: {
      title: "测试管理",
      elIcon: "Checked"
    },
    children: [
      {
        path: "testorder",
        component: () => import("@/views/testmanage/testorder/index.vue"),
        name: "TestOrder",
        meta: {
          title: "测试工单列表",
          keepAlive: true
        }
      },
      {
        path: "Questionlist",
        component: () => import("@/views/testmanage/Questionlist/index.vue"),
        name: "Questionlist",
        meta: {
          title: "疑问工单列表",
          keepAlive: true
        }
      },
      {
        path: "testprocess",
        component: () => import("@/views/testmanage/process/index.vue"),
        name: "TestProcess",
        meta: {
          title: "测试工艺列表",
          keepAlive: true
        }
      },
      {
        path: "check",
        component: () => import("@/views/testmanage/check/index.vue"),
        name: "Check",
        meta: {
          title: "工艺审核列表",
          keepAlive: true
        }
      },
      {
        path: "addprocess",
        component: () => import("@/views/testmanage/addprocess/index.vue"),
        name: "AddProcess",
        meta: {
          title: "测试工艺",
          keepAlive: true,
          hidden: true
        }
      },
      {
        path: "checktestlist",
        component: () => import("@/views/testmanage/check/testCheck/index.vue"),
        name: "checktestlist",
        meta: {
          title: "工艺审核",
          keepAlive: true,
          hidden: true
        }
      },
      {
        path: "testTypelist",
        component: () => import("@/views/testmanage/testType/index.vue"),
        name: "TestType",
        meta: {
          title: "测试类型列表",
          keepAlive: true
        }
      },
      {
        path: "Faultlist",
        component: () => import("@/views/testmanage/FaultList/index.vue"),
        name: "FaultList",
        meta: {
          title: "测试缺陷列表",
          keepAlive: true
        }
      },
      {
        path: "testmonitor",
        component: () => import("@/views/testmanage/testmonitor/index.vue"),
        name: "TestMonitor",
        meta: {
          title: "测试进度监控",
          keepAlive: true,
          hidden: true
        }
      },
      {
        path: "halt-hass",
        component: () => import("@/views/testmanage/halt-hass/index.vue"),
        name: "HaltHassProcess",
        meta: {
          title: "HALT-HASS工艺",
          keepAlive: true
        }
      },
      {
        path: "halt-hass/detail/:id",
        component: () => import("@/views/testmanage/halt-hass/detail.vue"),
        name: "HaltHassDetail",
        meta: {
          title: "工艺详情",
          keepAlive: false,
          hidden: true
        }
      }
    ]
  },
  {
    path: "/datamanage",
    component: Layouts,
    redirect: "/datamanage/report",
    name: "DataManage",
    meta: {
      title: "数据管理",
      elIcon: "Document"
    },
    children: [
      {
        path: "work-time",
        component: () => import("@/views/datamanage/work-time/index.vue"),
        name: "WorkTime",
        meta: {
          title: "工时管理",
          roles: ["15"], // 工时管理所需的权限
          keepAlive: true
        }
      },
      {
        path: "report",
        component: () => import("@/views/datamanage/historymange/index.vue"),
        name: "Report",
        meta: {
          title: "测试报告管理",
          keepAlive: true
        }
      },
      {
        path: "reportCheckList",
        component: () => import("@/views/datamanage/report/index.vue"),
        name: "reportCheckList",
        meta: {
          title: "报告审核列表",
          roles: ["16"],
          keepAlive: true
        }
      },
      {
        path: "checkReport",
        component: () => import("@/views/datamanage/report/reportCheck/index.vue"),
        name: "checkReport",
        meta: {
          title: "报告审核",
          keepAlive: true,
          hidden: true
        }
      },
      {
        path: "checkFunctionalReport",
        component: () => import("@/views/datamanage/report/functional-test-report-check/index.vue"),
        name: "checkFunctionalReport",
        meta: {
          title: "功能性测试报告审核",
          keepAlive: true,
          hidden: true
        }
      },
      {
        path: "checkTempReport",
        component: () => import("@/views/datamanage/report/tempReportCheck/index.vue"),
        name: "checkTempReport",
        meta: {
          title: "临时报告审核",
          keepAlive: true,
          hidden: true
        }
      },
      {
        path: "reportView",
        component: () => import("@/views/datamanage/historymange/reportPre/index.vue"),
        name: "reportView",
        meta: {
          title: "报告预览",
          keepAlive: true,
          hidden: true
        }
      },
      {
        path: "tempReportView",
        component: () => import("@/views/datamanage/historymange/tempReportPre/index.vue"),
        name: "tempReportView",
        meta: {
          title: "临时报告预览",
          keepAlive: true,
          hidden: true
        }
      },
      {
        path: "datastore",
        component: () => import("@/views/datamanage/datastore/index.vue"),
        name: "DataStore",
        meta: {
          title: "数据归档与回溯",
          keepAlive: true
        }
      },
      {
        path: "check-item-lib-list",
        component: () => import("@/views/datamanage/datastore/checkItemLib/index.vue"),
        name: "checkItemLibList",
        meta: {
          title: "检测项库列表",
          keepAlive: true
        }
      },
      {
        path: "defect-item-lib-list",
        component: () => import("@/views/datamanage/datastore/defectItemLib/index.vue"),
        name: "defectItemLibList",
        meta: {
          title: "缺陷项库列表",
          keepAlive: true
        }
      },
      {
        path: "questionItemLibList",
        component: () => import("@/views/datamanage/datastore/questionItemLib/index.vue"),
        name: "questionItemLibList",
        meta: {
          title: "疑问项库列表",
          keepAlive: true
        }
      }
    ]
  },
  {
    path: "/permission",
    component: Layouts,
    redirect: "/permission/page",
    name: "Permission",
    meta: {
      title: "权限管理",
      svgIcon: "lock",
      roles: ["18", "19"], // 可以在根路由中设置角色
      alwaysShow: true // 将始终显示根菜单
      // hidden: true
    },
    children: [
      {
        path: "user",
        component: () => import("@/views/permission/user/index.vue"),
        name: "UserManagement",
        meta: {
          title: "用户管理",
          roles: ["18"] // 用户管理所需的权限
        }
      },
      {
        path: "role",
        component: () => import("@/views/permission/role/index.vue"),
        name: "RoleManagement",
        meta: {
          title: "角色管理",
          roles: ["19"] // 角色管理所需的权限
        }
      },
      {
        path: "page",
        component: () => import("@/views/permission/page.vue"),
        name: "PagePermission",
        meta: {
          title: "页面级",
          roles: ["admin"], // 或者在子导航中设置角色
          hidden: true
        }
      },
      {
        path: "directive",
        component: () => import("@/views/permission/directive.vue"),
        name: "DirectivePermission",
        meta: {
          title: "按钮级", // 如果未设置角色，则表示：该页面不需要权限，但会继承根路由的角色
          hidden: true
        }
      }
    ]
  }
]

const router = createRouter({
  history,
  routes: routeSettings.thirdLevelRouteCache ? flatMultiLevelRoutes(constantRoutes) : constantRoutes
})

/** 重置路由 */
export function resetRouter() {
  // 注意：所有动态路由路由必须带有 Name 属性，否则可能会不能完全重置干净
  try {
    router.getRoutes().forEach((route) => {
      const { name, meta } = route
      if (name && meta.roles?.length) {
        router.hasRoute(name) && router.removeRoute(name)
      }
    })
  } catch {
    // 强制刷新浏览器也行，只是交互体验不是很好
    window.location.reload()
  }
}

export default router
