<script setup>
import { defineProps, ref } from 'vue'

const data = defineProps(['doc', 'answer', 'time'])
const isGood = ref(true)
isGood.value = parseInt(data.doc) === 1;
</script>

<template>
  <div class="bkg">
    <div class="bkg detail">
      <div id="avatar">
        <img v-show="isGood" src="@/assets/good_doc.png" alt="good_doc" />
        <img v-show="!isGood" src="@/assets/bad_doc.png" alt="bad_doc" />
      </div>
      <div id="chat">
        <div id="chat-content">
          <p>{{ data.answer }}</p>
        </div>
        <div id="chat-time">
          <span>{{ data.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.bkg {
  flex-grow: 1;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 20px 150px;
  font-size: 30px;

  .detail {
    padding: 0;
    margin-right: 40px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: stretch;
    flex-basis: 0;

    #avatar {
      flex-grow: 1;
      max-width: 35px;

      img {
        width: 35px;
        height: 35px;
        padding: 4px;
        border-radius: 12px;
        border: 1px solid #e1e1e1;
        box-shadow: 0 3px 3px rgba(0, 0, 0, 0.5);
      }
    }

    #chat {
      flex-direction: column;
      margin-left: 10px;
      flex-grow: 9;
      flex-basis: 0;

      #chat-content {
        width: 700px;
        flex-grow: 7;
        align-items: center;
        justify-content: center;
        margin-bottom: 4px;

        p {
          min-width: 100px;
          max-width: 700px;
          margin-top: 2px;
          padding: 6px 20px;
          border-radius: 12px;
          background-color: #f2f2f2;
          border: 2px solid #e1e1e1;
          font-size: 15px;
          font-weight: bold;
        }
      }

      #chat-time {
        flex-grow: 1;
        font-size: 12px;
        padding-left: 10px;
      }
    }
  }
}
</style>