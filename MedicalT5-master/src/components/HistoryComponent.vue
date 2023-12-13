<script setup>
import { ref, defineProps } from 'vue'
import { Edit, DeleteFilled } from '@element-plus/icons-vue'
import 'animate.css'

const edit_show = ref(false)
const isDelete = ref(false)
const data = defineProps(['id', 'title', 'count', 'time'])
const edit_input = ref(false)
const input_box = ref(null)
const new_title = ref('')
const emit = defineEmits(['edit', 'delete', 'active'])
const edit_warning = ref(false)

/* 处理用户编辑事件的申请 */
function handle_edit() {
  edit_input.value = true
  setTimeout(() => {
    input_box.value.focus()
  }, 0)
}

/* 处理用户更改标题后的保存事件 */
function handle_save() {
  if (input_box.value.value.length > 12) {
    edit_warning.value = true
    setTimeout(() => {
      edit_warning.value = false
    }, 1500)
  } else {
    if (edit_input.value === true) {
      edit_input.value = false
      new_title.value = input_box.value.value
      /* 判断标题是否合法 */
      if (new_title.value !== data.title) {
        if (new_title.value === '') {
          new_title.value = '新的聊天'
        }
        emit('edit', data.id, new_title.value)
      }
    }
  }
}

function is_delete() {
  isDelete.value = !isDelete.value
}

function handle_active() {
  if (!isDelete.value) {
    emit('active', data.id)
  }
}

function handle_delete() {
  emit('delete', data.id)
}
</script>

<template>
  <div
    class="history"
    @mouseover="
      () => {
        edit_show = true
      }
    "
    @mouseleave="
      () => {
        edit_show = false
      }
    "
    @click="handle_active"
  >
    <input
      placeholder="新的聊天"
      ref="input_box"
      type="text"
      :value="data.title"
      v-show="edit_input"
      @keyup.enter="handle_save"
      @blur="handle_save"
    />
    <span v-show="!edit_input" class="history-title">
      {{ data.title }}
    </span>
    <div>
      <transition name="edit">
        <el-icon color="#939393" v-show="edit_show" @click="handle_edit">
          <Edit />
        </el-icon>
      </transition>
    </div>
    <div>
      <transition name="delete">
        <el-icon
          color="#939393"
          v-show="edit_show"
          @click="handle_delete"
          @mouseenter="is_delete"
          @mouseleave="is_delete"
        >
          <DeleteFilled />
        </el-icon>
      </transition>
    </div>
    <span v-show="!edit_warning" class="history-count"> 共{{ data.count }}条对话 </span>
    <span id="warning-msg" v-show="edit_warning">请小于十个字符！</span>
    <span class="history-time">
      {{ data.time }}
    </span>
  </div>
</template>

<style scoped lang="less">
.history {
  display: grid;
  grid-template-columns: 5fr 3fr 1fr 1fr;
  margin-top: 7px;
  margin-bottom: 7px;
  width: 270px;
  min-height: 65px;
  max-height: 85px;
  border-radius: 10px;
  background-color: white;
  transition-duration: 0.4s;
  border: 2px solid transparent;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);

  input {
    width: 180px;
    height: 20px;
    margin-top: 4px;
    justify-self: center;
    align-items: center;
    border-radius: 8px;
    border: 1px solid #e5e5e5;
    grid-column-start: 1;
    grid-column-end: 3;
  }

  input:focus {
    outline: 1px solid #a6a6a6;
  }

  .history-title {
    margin-left: 15px;
    font-size: 16px;
    font-weight: bolder;
    justify-self: start;
    align-items: center;
    grid-column-start: 1;
    grid-column-end: 3;
  }

  .history-count {
    color: #a6a6a6;
    margin-left: 15px;
    font-size: 13px;
    justify-self: start;
  }

  #warning-msg {
    color: red;
    margin-left: 15px;
    font-size: 13px;
    justify-self: start;
    animation: headShake 0.6s;
  }

  .history-time {
    color: #a6a6a6;
    margin-right: 15px;
    font-size: 12px;
    justify-self: end;
    grid-column-start: 2;
    grid-column-end: 5;
  }

  .edit-enter-active {
    animation: fadeInDown 0.4s;
  }

  .edit-leave-active {
    animation: fadeOutUp 0.4s;
  }

  .delete-enter-active {
    animation: fadeInDown 0.4s;
  }

  .delete-leave-active {
    animation: fadeOutUp 0.4s;
  }

  .el-icon:hover {
    cursor: pointer;
    color: #333333;
  }
}

.history:hover {
  transition-duration: 0.4s;
  background-color: #f3f3f3;
}
</style>
