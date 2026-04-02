<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { useUserStore } from "@/store/modules/user"
import { ElMessage, type FormInstance, type FormRules } from "element-plus"
import { type LoginRequestData } from "@/api/login/types/login"
import ThemeSwitch from "@/components/ThemeSwitch/index.vue"
import Owl from "./components/Owl.vue"
import { useFocus } from "./hooks/useFocus"
import { setToken } from "@/utils/cache/cookies"

const router = useRouter()
const { isFocus, handleBlur, handleFocus } = useFocus()

/** 登录表单元素的引用 */
const loginFormRef = ref<FormInstance | null>(null)

/** 登录按钮 Loading */
const loading = ref(false)
/** 登录表单数据 */
const loginFormData: LoginRequestData = reactive({
  username: "admin",
  password: "",
  code: ""
})
/** 登录表单校验规则 */
const loginFormRules: FormRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 8, max: 16, message: "长度在 8 到 16 个字符", trigger: "blur" }
  ]
}
/** 登录逻辑 */
const handleLogin = () => {
  loginFormRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      loading.value = true
      useUserStore()
        .login(loginFormData)
        .then(() => {
          router.push({ path: "/" })
        })
        .catch(() => {
          loginFormData.password = ""
        })
        .finally(() => {
          loading.value = false
        })
    } else {
      console.error("表单校验不通过", fields)
    }
  })
}
const handleSSOLogin = () => {
  const returnUrl = encodeURIComponent(window.location.href)
  const ssoUrl = `http://166.111.188.57:3636/#/sso?system=${import.meta.env.VITE_APP_ISS}&type=html&redirect=${returnUrl}`
  window.location.href = ssoUrl
}
onMounted(() => {
  if (router.currentRoute.value.query.token !== undefined) {
    setToken(router.currentRoute.value.query.token as string)
    router.push({ path: "/" })
  }
  if (router.currentRoute.value.query.message !== undefined) {
    if (router.currentRoute.value.query.message === "illegal") {
      ElMessage.error("该系统不支持或已被禁用SSO登录")
      router.push({ path: "/login" })
    } else {
      ElMessage.error(router.currentRoute.value.query.message as string)
      router.push({ path: "/login" })
    }
  }
})
</script>

<template>
  <div class="login-container">
    <ThemeSwitch class="theme-switch" />
    <Owl :close-eyes="isFocus" />
    <div class="login-card">
      <div class="title">
        <img alt="" src="@/assets/layouts/logo-text-2.png" />
      </div>
      <div class="content">
        <el-form ref="loginFormRef" :model="loginFormData" :rules="loginFormRules" @keyup.enter="handleLogin">
          <el-form-item prop="username">
            <el-input
              v-model.trim="loginFormData.username"
              placeholder="用户名"
              prefix-icon="User"
              size="large"
              tabindex="1"
              type="text"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model.trim="loginFormData.password"
              placeholder="密码"
              prefix-icon="Lock"
              show-password
              size="large"
              tabindex="2"
              type="password"
              @blur="handleBlur"
              @focus="handleFocus"
            />
          </el-form-item>
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center">
            <el-button :loading="loading" size="large" type="primary" @click.prevent="handleLogin">登 录</el-button>
            <el-button :loading="loading" size="large" type="success" @click.prevent="handleSSOLogin">
              <el-icon style="margin-right: 5px">
                <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M13.0607 8.11097L14.4749 9.52518C17.2086 12.2589 17.2086 16.691 14.4749 19.4247L14.1214 19.7782C11.3877 22.5119 6.95555 22.5119 4.22188 19.7782C1.48821 17.0446 1.48821 12.6124 4.22188 9.87874L5.6361 11.293C3.68348 13.2456 3.68348 16.4114 5.6361 18.364C7.58872 20.3166 10.7545 20.3166 12.7072 18.364L13.0607 18.0105C15.0133 16.0578 15.0133 12.892 13.0607 10.9394L11.6465 9.52518L13.0607 8.11097ZM19.7782 14.1214L18.364 12.7072C20.3166 10.7545 20.3166 7.58872 18.364 5.6361C16.4114 3.68348 13.2456 3.68348 11.293 5.6361L10.9394 5.98965C8.98678 7.94227 8.98678 11.1081 10.9394 13.0607L12.3536 14.4749L10.9394 15.8891L9.52518 14.4749C6.79151 11.7413 6.79151 7.30911 9.52518 4.57544L9.87874 4.22188C12.6124 1.48821 17.0446 1.48821 19.7782 4.22188C22.5119 6.95555 22.5119 11.3877 19.7782 14.1214Z"
                  />
                </svg>
              </el-icon>
              SSO登录
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100%;

  .theme-switch {
    position: fixed;
    top: 5%;
    right: 5%;
    cursor: pointer;
  }

  .login-card {
    width: 480px;
    max-width: 90%;
    border-radius: 20px;
    box-shadow: 0 0 10px #dcdfe6;
    background-color: var(--el-bg-color);
    overflow: hidden;

    .title {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 150px;

      img {
        height: 100%;
      }
    }

    .content {
      padding: 20px 50px 50px 50px;

      :deep(.el-input-group__append) {
        padding: 0;
        overflow: hidden;

        .el-image {
          width: 100px;
          height: 40px;
          border-left: 0px;
          user-select: none;
          cursor: pointer;
          text-align: center;
        }
      }

      .el-button {
        width: 100%;
        margin-top: 10px;
        margin-left: 0;
      }
    }
  }
}
</style>
