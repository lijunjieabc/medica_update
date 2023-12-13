import { defineStore } from 'pinia';

export const userInfo = defineStore({
    id: 'userInfo',
    state: () => ({
        data: null, // 用于存储res.data的状态
    }),
    actions: {
        async fetchData(data) {
            this.data = data; // 更新状态
        },
    },
});