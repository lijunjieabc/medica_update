<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useRouter } from 'vue-router'

const URL = 'http://10.100.136.114:8080'
const router = useRouter()
let right_panel_active = ref(true)
const container_from = ref(null)
const container = ref(null)
const re_password = ref('')
const re_username = ref('')
const log_username = ref('')
const log_password = ref('')
const loading = ref(false)

function re_judge() {
  if (re_password.value == '' || re_username.value == '') {
    open1()
  } else if (!/^\d+$/.test(re_username.value)) {
    ElMessage({
      message: '用户名只能输入数字',
      type: 'warning'
    })
  } else if (!/^[a-zA-Z0-9]+$/.test(re_password.value)) {
    ElMessage({
      message: '密码只能输入数字和字母大小写组合',
      type: 'warning'
    })
  } else {
    let re_userinfo = {
      name: re_username.value,
      password: re_password.value
    }

    axios
      .post(URL + '/register', re_userinfo, {
        headers: { 'Content-Type': 'application/json;charset=UTF-8', Accept: '*' },
        timeout: 30000
      })
      .then((res) => {
        console.log(res)
        if (res.data.code !== 1) {
          open3()
        } else {
          right_panel_active.value = false
          open2()
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }
}

function log_judge() {
  if (log_password.value == '' || log_username.value == '') {
    open1()
  } else if (!/^\d+$/.test(log_username.value)) {
    ElMessage({
      message: '用户名只能输入数字',
      type: 'warning'
    })
  } else if (!/^[a-zA-Z0-9]+$/.test(log_password.value)) {
    ElMessage({
      message: '密码只能输入数字和字母大小写组合',
      type: 'warning'
    })
  } else {
    let log_userinfo = {
      name: log_username.value,
      password: log_password.value
    }
    axios
      .post(URL + '/login', log_userinfo, {
        headers: { 'Content-Type': 'application/json;charset=UTF-8', Accept: '*' },
        timeout: 30000
      })
      .then((res) => {
        console.log(res)
        if (res.data.code === 1) {
          open4()
          console.log(res.data)
          loading.value = true
          axios
            .get(URL + '/sessions/' + log_username.value, log_userinfo, {
              headers: { 'Content-Type': 'application/json;charset=UTF-8', Accept: '*' },
              timeout: 30000
            })
            .then((res) => {
              console.log(res.data)
              const data = res.data.data
              localStorage.setItem('isLogin', 'true')
              localStorage.setItem('UserId', log_username.value)
              loading.value = false
              router.push('/chat')
            })
            .catch((err) => {
              console.log(err)
            })
        }
        if (res.data.msg === '用户名错误') {
          ElMessage({
            message: '登录失败，没有此用户名！',
            type: 'error'
          })
        }
        if (res.data.msg === '密码错误') {
          ElMessage({
            message: '登录失败，密码错误！',
            type: 'error'
          })
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }
}

function open2() {
  ElMessage({
    message: '注册成功！',
    type: 'success'
  })
}

function open1() {
  ElMessage({
    message: '请输入用户名或密码！',
    type: 'warning'
  })
}

const open3 = () => {
  ElMessage({
    message: '用户名已存在！',
    type: 'error'
  })
}

const open4 = () => {
  ElMessage({
    message: '登录成功！',
    type: 'success'
  })
}
</script>

<template>
  <!-- 整体布局-->
  <div ref="container" :class="{ container: true, 'right-panel-active': right_panel_active }">
    <!-- 注册框-->
    <div ref="container_from" class="container_from container--signup">
      <div action="#" class="from" id="from1">
        <h2 class="from_title">注册账号</h2>
        <input v-model="re_username" type="text" placeholder="User" class="input" />
        <input v-model="re_password" type="password" placeholder="Password" class="input" />
        <button class="btn" @click="re_judge">点击注册</button>
      </div>
    </div>
    <!-- 登录框-->
    <div
      v-loading="loading"
      element-loading-text="加载中..."
      class="container_from container--signin"
    >
      <div action="#" class="from" id="from2">
        <h2 class="from_title">欢迎登录</h2>
        <input v-model="log_username" type="text" placeholder="User" class="input" />
        <input v-model="log_password" type="password" placeholder="Password" class="input" />
        <a href="#" class="link">忘记密码？</a>
        <button class="btn" @click="log_judge">登录</button>
      </div>
    </div>

    <div class="container_overlay">
      <div class="overlay">
        <div class="overlay_panel overlay--left">
          <button
            class="btn"
            @click="
              () => {
                right_panel_active = false
              }
            "
          >
            已有账号，直接登录
          </button>
        </div>

        <div class="overlay_panel overlay--right">
          <button
            class="btn"
            @click="
              () => {
                right_panel_active = true
              }
            "
          >
            没有账号，点击注册
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --white: #e9e9e9;
  --gray: #333;
  --green: #025e6c;
  --lightgreen: #25c8d0;

  --button-radius: 0.7rem;

  --max-width: 758px;
  --max-height: 420px;

  font-size: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
    'Open Sans', 'Helvetica Neue', sans-serif;
}

body {
  align-items: center;
  background: #e9e9e9 url('@/assets/background.png') no-repeat fixed center;
  background-size: auto;
  display: grid;
  height: 100vh;
  place-items: center;
}

.from_title {
  font-weight: 300;
  margin: 0;
  margin-bottom: 1.25rem;
}

.link {
  color: var(--gray);
  font-size: 0.9rem;
  margin: 1.5rem 0;
  text-decoration: none;
}

.container {
  background-color: var(--white);
  border-radius: var(--button-radius);
  box-shadow: 0 0.9rem 1.7rem rgba(0, 0, 0, 0.25);
  height: var(--max-height);
  //max-width: var(--max-height);
  overflow: hidden;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: var(--max-width);
}

.container_from {
  height: 100%;
  position: absolute;
  top: 0;
  transition: all 0.6s ease-in-out;
}

.container--signin {
  left: 0;
  width: 50%;
  z-index: 2;
}

.container.right-panel-active .container--signin {
  transform: translateX(100%);
}

.container--signup {
  left: 0;
  opacity: 0;
  width: 50%;
  z-index: 1;
}

.container.right-panel-active .container--signup {
  animation: show 0.6s;
  opacity: 1;
  transform: translateX(100%);
  z-index: 5;
}

.container_overlay {
  height: 100%;
  left: 50%;
  overflow: hidden;
  position: absolute;
  top: 0;
  transition: transform 0.6s ease-in-out;
  width: 50%;
  z-index: 100;
}

.container.right-panel-active .container_overlay {
  transform: translateX(-100%);
}

.overlay {
  background: #e9e9e9 url('@/assets/background.png') no-repeat fixed center;
  background-size: auto;
  height: 100%;
  left: -100%;
  position: relative;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
  width: 200%;
}

.container.right-panel-active .overlay {
  transform: translateX(50%);
}

.overlay_panel {
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  position: absolute;
  text-align: center;
  top: 0;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
  width: 50%;
}

.overlay--left {
  transform: translateX(-20%);
}

.container.right-panel-active .overlay--left {
  transform: translateX(0);
}

.overlay--right {
  right: 0;
  transform: translateX(0);
}

.container.right-panel-active .overlay--right {
  transform: translateX(20%);
}

.btn {
  background-color: var(--green);
  background-image: linear-gradient(90deg, var(--green) 0%, var(--lightgreen) 74%);
  border-radius: 20px;
  border: 1px solid var(--green);
  color: var(--white);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: bold;
  letter-spacing: 0.1rem;
  padding: 0.9rem 4rem;
  text-transform: uppercase;
  transition: transform 80ms ease-in;
}

.from > .btn {
  margin-top: 1.5rem;
}

.btn:active {
  transform: scale(0.95);
}

.btn:focus {
  outline: none;
}

.from {
  background-color: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 3rem;
  height: 100%;
  text-align: center;
}

.input {
  background-color: #fff;
  border: none;
  padding: 0.9rem 0.9rem;
  margin: 0.5rem 0;
  width: 100%;
}

@keyframes show {
  0%,
  49.99% {
    opacity: 0;
    z-index: 1;
  }

  50%,
  100% {
    opacity: 0;
    z-index: 5;
  }
}

.btn1 {
  background-color: var(--green);
  background-image: linear-gradient(90deg, var(--green) 0%, var(--lightgreen) 74%);
  border-radius: 20px;
  border: 1px solid var(--green);
  color: var(--white);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: bold;
  letter-spacing: 0.1rem;
  padding: 0.9rem 4rem;
  text-transform: uppercase;
  transition: transform 80ms ease-in;
}
</style>