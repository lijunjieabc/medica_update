<script setup>
import {ref, watch, toRaw, onMounted} from 'vue'
import {Plus, Fold, Promotion, Loading} from '@element-plus/icons-vue'
import 'animate.css'
import {ElMessage} from 'element-plus'
import HistoryComponent from '@/components/HistoryComponent.vue'
import DocComponent from '@/components/DocComponent.vue'
import MeComponent from '@/components/MeComponent.vue'
import router from '@/router'
import axios from 'axios'

/* 全局的URL接口 */
const URL = 'http://10.100.136.114:8080'
/* 全局的UserId */
const UserId = ref(parseInt(localStorage.getItem('UserId')))
/* 全局的usr_id，用于添加 */
const UsrId = ref(null)
/* 左侧侧边栏的对话记录 */
const history = ref(null)
/* 判断是否显示在请求时的Loading效果 */
const isLoading = ref(false)
/* 绑定输入框中的内容 */
const content = ref('')
/* 绑定发送按钮样式 */
const send_icon = ref(false)
/* 判断发送按钮是否可用 */
const send_btn = ref(null)
/* 正则表达式，用以匹配输入框为空的情况 */
const regex = /^\s*$/
/* 获取right-main main对象，用以翻页 */
const text_main = ref(null)
/* 绑定模型选择按钮 */
const doctor = ref('神医')
/* 对应对话的详细聊天记录 */
const chat_detail = ref(null)
/* 定义当前选中，默认为历史记录中第一个 */
const activeId = ref(null)
/* 定义当前对话 */
const currentChat = ref({
  title: '',
  count: 0,
})
/* 用来接收返回的数据 */
const tmp_answer = ref(null)

// 因为设置了路由守卫和持久化登录，所以每次进入需要刷新左侧历史记录列表
axios
    .get(URL + '/sessions/' + UserId.value, {
      headers: {'Content-Type': 'application/json;charset=UTF-8', Accept: '*'},
      timeout: 30000
    })
    .then((res) => {
      console.log(res.data.data)
      history.value = res.data.data
      UsrId.value = history.value[0].usrId
      activeId.value = history.value[0].id

      /* 获取首个会话的聊天记录 */
      axios
          .get(URL + `/history/` + activeId.value, {
            headers: {'Content-Type': 'application/json;charset=UTF-8', Accept: '*'},
            timeout: 30000
          })
          .then((res) => {
            if (res.status === 200) {
              console.log(res.data)
              chat_detail.value = res.data
              setTimeout(() => {
                text_main.value.scrollTop = text_main.value.scrollHeight
              }, 0)
            }
          })
      currentChat.value = history.value.find((item) => item.id === activeId.value)
    })


/* 侦听textarea中是否有内容产生，产生相应的图标变化 */
watch(content, async (new_content) => {
  if (!regex.test(new_content)) {
    send_btn.value.style.backgroundColor = '#409eff'
    send_icon.value = true
  } else {
    send_btn.value.style.backgroundColor = 'transparent'
    send_icon.value = false
  }
})

/* 处理注销事件，清除所有本地存储 */
function handleLogout() {
  localStorage.clear()
  router.push('/')
}

/* 打字机效果 */
function typeWriter(originalText) {
  let index = 0;
  const textInterval = 10; // 两个字符之间的时间间隔（毫秒）

  // 使用定时器逐步显示文本
  const timer = setInterval(() => {
    chat_detail.value[chat_detail.value.length - 1].answer += originalText[index];
    text_main.value.scrollTop = text_main.value.scrollHeight
    // 如果已经显示完整的文本，则清除定时器
    if (++index === originalText.length) {
      clearInterval(timer);
      content.value = ''
      isLoading.value = false
    }
  }, textInterval);
}

// 处理发送消息事件
async function sendmsg() {
  if (regex.test(content.value)) {
    ElMessage({
      message: "Oops, you haven't filled in the blanks yet.",
      type: 'warning',
      duration: 1800
    })
    content.value = ''
  } else {
    let tmp = toRaw(chat_detail.value)
    tmp.push({
      id: tmp.length + 1,
      sessionId: activeId.value,
      question: content.value.replace('\n', ''),
      updateTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
      doctor: doctor.value === '神医' ? 1 : 0,
      answer: 'Loading...'
    })
    chat_detail.value = tmp
    setTimeout(() => {
      text_main.value.scrollTop = text_main.value.scrollHeight
    }, 10)
    send_btn.value.style.backgroundColor = 'transparent'
    send_icon.value = false
    isLoading.value = true
    axios.post(URL + '/chat', {
      question: content.value.replace('\n', ''),
      sessionId: activeId.value,
      doctor: doctor.value === '神医' ? 1 : 0
    }).then((res) => {
      if (res.data.code === 1) {
        console.log(res.data)
        tmp_answer.value = res.data.data[res.data.data.length - 1].answer
      } else {
        let del = toRaw(chat_detail.value)
        chat_detail.value = del.pop()
        isLoading.value = false
      }
    }).catch((err)=>{
      ElMessage({
        message: 'Oops, something went wrong.',
        type: 'error',
        duration: 1800
      })
      console.log(err)
      let del = toRaw(chat_detail.value)
      chat_detail.value = del.pop()
      isLoading.value = false
    })
  }
}

/* 监听最后一条聊天记录 */
watch(tmp_answer, async (new_answer) => {
  if (new_answer !== null) {
    chat_detail.value[chat_detail.value.length - 1].answer = ''
    typeWriter(tmp_answer.value)
    setTimeout(() => {
      // 将容器滚动到底部
      text_main.value.setScrollTop(text_main.value.height)
    }, 0)
    tmp_answer.value = null
  }
})

/* 处理当前选择的聊天样式 */
function toggleActive(id) {
  activeId.value = id
  currentChat.value = history.value.find((item) => item.id === activeId.value)
  axios
      .get(URL + `/history/` + activeId.value, {
        headers: {'Content-Type': 'application/json;charset=UTF-8', Accept: '*'},
        timeout: 30000
      })
      .then((res) => {
        if (res.status === 200) {
          chat_detail.value = res.data
          setTimeout(() => {
            text_main.value.scrollTop = text_main.value.scrollHeight
          }, 0)
        }
      })
}

/* 处理标题更改事件 */
function TitleChange(id, new_title) {
  history.value.find((item) => item.id === id).title = new_title
  let tmp_data = JSON.stringify({
    usrId: UsrId.value,
    title: new_title,
    id: id
  })
  axios
      .put(URL + '/update', tmp_data, {
        headers: {'Content-Type': 'application/json;charset=UTF-8', Accept: '*'},
        timeout: 30000
      })
      .then((res) => {
        if (res.status === 200) {
          ElMessage({
            message: '修改成功！',
            type: 'success',
            duration: 1000
          })
        } else {
          ElMessage({
            message: '修改失败！',
            type: 'error',
            duration: 1000
          })
        }
      })
}

/* 处理删除事件 */
function HandleDelete(id) {
  if (history.value.length === 1) {
    ElMessage({
      message: '至少保留一个聊天！',
      type: 'warning',
      duration: 1000
    })
  } else {
    axios
        .post(URL + '/delete/' + id, {
          headers: {'Content-Type': 'application/json;charset=UTF-8', Accept: '*'},
          timeout: 30000
        })
        .then((res) => {
          if (res.status === 200) {
            let index = history.value.findIndex((item) => item.id === id)
            if (activeId.value === id) {
              toggleActive(history.value[index + 1].id)
            }
            history.value.splice(index, 1)
            ElMessage({
              message: '删除成功！',
              type: 'success',
              duration: 1000
            })
          } else {
            ElMessage({
              message: '删除失败！',
              type: 'error',
              duration: 1000
            })
          }
        })
  }
}

/* 处理添加新对话事件 */
function handleAdd() {
  axios
      .post(URL + `/session/${parseInt(UsrId.value)}`, {
        headers: {'Content-Type': 'application/json;charset=UTF-8', Accept: '*'},
        timeout: 30000
      })
      .then((res) => {
        if (res.status === 200) {
          ElMessage({
            message: '添加成功！',
            type: 'success',
            duration: 1000
          })
          history.value = res.data.data
        }
      }).catch((err) => {
    console.log(err)
    ElMessage({
      message: '添加失败！',
      type: 'error',
      duration: 1000
    })
  })
}

/* 在所有DOM渲染完毕后翻页到聊天记录的末尾 */
onMounted(() => {
  text_main.value.scrollTop = text_main.value.scrollHeight
})
</script>

<template>
  <div class="container">
    <div class="left-nav">
      <div class="left-nav header">
        <div id="nav-title">
          <span style="margin-left: 20px; font-size: 25px; font-weight: bold">Medical T5</span>
          <span style="margin-left: 20px; font-size: 15px">Build your own AI doctor</span>
        </div>
        <div id="nav-icon">
          <svg
              style="fill: #cdecf6"
              xmlns="http://www.w3.org/2000/svg"
              height="4em"
              viewBox="0 0 576 512"
          >
            <path
                d="M142.4 21.9c5.6 16.8-3.5 34.9-20.2 40.5L96 71.1V192c0 53 43 96 96 96s96-43 96-96V71.1l-26.1-8.7c-16.8-5.6-25.8-23.7-20.2-40.5s23.7-25.8 40.5-20.2l26.1 8.7C334.4 19.1 352 43.5 352 71.1V192c0 77.2-54.6 141.6-127.3 156.7C231 404.6 278.4 448 336 448c61.9 0 112-50.1 112-112V265.3c-28.3-12.3-48-40.5-48-73.3c0-44.2 35.8-80 80-80s80 35.8 80 80c0 32.8-19.7 61-48 73.3V336c0 97.2-78.8 176-176 176c-92.9 0-168.9-71.9-175.5-163.1C87.2 334.2 32 269.6 32 192V71.1c0-27.5 17.6-52 43.8-60.7l26.1-8.7c16.8-5.6 34.9 3.5 40.5 20.2zM480 224a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"
            />
          </svg>
        </div>
      </div>
      <div class="left-nav main">
        <HistoryComponent
            v-for="item in history"
            :key="item.id"
            :style="{ borderColor: activeId === item.id ? '#1d93ab' : 'transparent' }"
            :id="item.id"
            :title="item.title"
            :count="item.count"
            :time="item.time.replace('T', ' ')"
            @edit="TitleChange"
            @delete="HandleDelete"
            @active="toggleActive"
        >
        </HistoryComponent>
      </div>
      <div class="left-nav footer">
        <el-tooltip class="box-item" effect="dark" content="Logging Out" placement="top-start">
          <button
              id="login-out"
              @click="handleLogout"
          >
            <el-icon size="large">
              <Fold/>
            </el-icon>
          </button>
        </el-tooltip>
        <button id="add-new-chat" @click="handleAdd">
          <el-icon size="large">
            <Plus/>
          </el-icon>
          <span style="font-size: 15px; font-weight: bold">添加新对话</span>
        </button>
      </div>
    </div>
    <div class="right-main">
      <div class="right-main header">
        <div class="right-main header title">
          <span style="font-size: 30px; font-weight: bold">{{ currentChat.title }}</span>
          <span style="font-size: 18px">共{{ currentChat.count }}条对话</span>
        </div>
        <div class="right-main header change-button">
          <el-radio-group v-model="doctor" size="default">
            <el-radio-button label="庸医"/>
            <el-radio-button label="神医"/>
          </el-radio-group>
        </div>
      </div>
      <div ref="text_main" class="right-main main">
        <div class="right-main main chat" v-for="item in chat_detail" :key="item.id">
          <MeComponent
              :question="item.question"
              :time="item.updateTime.replace('T', ' ')"
          ></MeComponent>
          <DocComponent
              :doc="item.doctor"
              :answer="item.answer"
              :time="item.updateTime.replace('T', ' ')"
          ></DocComponent>
        </div>
      </div>
      <div class="right-main footer">
        <div class="right-main footer input">
          <div class="right-main footer input text-area">
            <textarea
                v-model="content"
                @keyup.enter="sendmsg"
                autofocus
                placeholder="Send a message..."
                rows="1"
            ></textarea>
            <el-tooltip class="box-item" effect="dark" content="Send Message" placement="top">
              <button ref="send_btn" :disabled="!send_icon" id="send-msg" @click="sendmsg">
                <el-icon v-show="!send_icon && !isLoading" color="#dedee5" size="25">
                  <Promotion/>
                </el-icon>
                <el-icon v-show="send_icon && !isLoading" color="white" size="25">
                  <Promotion/>
                </el-icon>
                <el-icon class="is-loading" color="#dedee5" size="25" v-show="isLoading">
                  <Loading/>
                </el-icon>
              </button>
            </el-tooltip>
          </div>
        </div>
        <span id="remind" style="color: #a6a6a6"
        >Medical T5 can make mistakes, please consult a medical professional before proceeding
          with the relevant treatment.</span
        >
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  margin: 0;
  padding: 0;
  width: 100svw;
  height: 100svh;
  display: flex;

  .left-nav {
    background-color: #e7f8ff;
    display: flex;
    flex-basis: 0;
    flex-direction: column;
    flex-grow: 1;

    .header {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      flex-basis: 0;
      flex-grow: 2;

      #nav-title {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        flex-basis: 0;
        flex-grow: 2;
      }

      #nav-icon {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        flex-basis: 0;
        flex-grow: 1;
      }
    }
  }

  .main {
    position: relative;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    flex-basis: 0;
    flex-grow: 8;
    overflow: auto;
  }

  .main::-webkit-scrollbar {
    width: 3px; /* 设置滚动条宽度 */
  }

  .main::-webkit-scrollbar-track {
    background-color: transparent; /* 设置滚动条背景色 */
    border-radius: 20px;
  }

  .main::-webkit-scrollbar-thumb {
    background-color: #888; /* 设置滚动条滑块颜色 */
    border-radius: 20px;
  }

  .main::-webkit-scrollbar-thumb:active {
    background-color: #666;
  }

  .footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
    flex-basis: 0;
    flex-grow: 1;

    #login-out {
      display: flex;
      align-items: center;
      justify-content: space-around;
      flex-grow: 1;
      min-width: 40px;
      max-width: 60px;
      height: 40px;
      border-radius: 10px;
      background-color: white;
      transition-duration: 0.4s;
      border: 2px solid transparent;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
    }

    #login-out:hover {
      transition-duration: 0.4s;
      background-color: #e5e5e5;
      cursor: pointer;
    }

    #login-out:active {
      transition-duration: 0.2s;
      background-color: #c1c5c8;
    }

    #add-new-chat {
      display: flex;
      align-items: center;
      justify-content: space-around;
      flex-grow: 3;
      min-width: 120px;
      max-width: 200px;
      height: 40px;
      border-radius: 10px;
      background-color: white;
      transition-duration: 0.4s;
      border: 2px solid transparent;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
    }

    #add-new-chat:hover {
      transition-duration: 0.4s;
      background-color: #e5e5e5;
      cursor: pointer;
    }

    #add-new-chat:active {
      transition-duration: 0.2s;
      background-color: #c1c5c8;
    }
  }

  .right-main {
    display: flex;
    flex-direction: column;
    flex-grow: 4;
    flex-basis: 0;
    background-color: white;

    .header {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: center;
      flex-basis: 0;
      flex-grow: 2;

      .title {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex-basis: 0;
        flex-grow: 4;
        border-bottom: 3px solid #e5e5e5;
      }

      .change-button {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-basis: 0;
        flex-grow: 2;
      }
    }

    .main {
      flex-grow: 8;
      height: 10000px;
      display: flex;
      flex-direction: column;
      overflow: auto;
      align-items: center;
      justify-content: flex-start;

      .chat {
        display: flex;
        overflow: unset;
        flex-direction: column;
        align-items: center;
        justify-content: space-evenly;
        margin: 0 0;
        padding: 0;
        background-color: transparent;
      }
    }

    .footer {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      flex-basis: 0;
      flex-grow: 1.3;

      .input {
        background-color: transparent;
        flex-direction: row;
        min-height: 20px;
        max-height: 600px;
        flex-grow: 6;
        width: 100%;
        align-items: flex-end;
        justify-content: center;

        .text-area {
          padding-left: 18px;
          padding-right: 18px;
          flex-direction: row;
          justify-content: space-around;
          align-items: center;
          max-width: 850px;
          min-width: 200px;
          margin-bottom: 4px;
          height: 50px;
          border-radius: 10px;
          background-color: white;
          transition-duration: 0.4s;
          border: 1px solid rgba(242, 242, 242, 0.4);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);

          textarea {
            margin-right: 20px;
            flex-basis: 0;
            flex-grow: 20;
            width: 95%;
            height: auto;
            font-family: 'CustomFont', Arial, sans-serif;
            border-color: transparent;
            resize: none;
            font-size: 17px;
          }

          textarea:focus {
            border-color: transparent;
            outline: none;
          }

          textarea::-webkit-scrollbar {
            width: 3px; /* 设置滚动条宽度 */
          }

          textarea::-webkit-scrollbar-track {
            background-color: transparent; /* 设置滚动条背景色 */
            border-radius: 20px;
          }

          textarea::-webkit-scrollbar-thumb {
            background-color: #888; /* 设置滚动条滑块颜色 */
            border-radius: 20px;
          }

          textarea::-webkit-scrollbar-thumb:active {
            background-color: #666;
          }

          #send-msg {
            flex-basis: 0;
            flex-grow: 1;
            width: 35px;
            height: 35px;
            border-radius: 4px;
            border-color: transparent;
            background-color: transparent;
            transition: ease-in-out 0.2s;
          }

          #send-msg:active {
            background-color: #8f9eff;
            transition: ease-in-out 0.2s;
          }
        }
      }

      #remind {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        justify-content: center;
        flex-basis: 1px;
        flex-grow: 1;
        width: 100%;
        font-size: 15px;
      }
    }
  }
}
</style>
