import {createStore} from "vuex";

export const store = createStore({
    state: {
        data: null,
    },
    getters: {},
    mutations: {
        receivedNewData: (state, payload) => {
            state.data = payload
        },
    },
    actions: {
        receivedNewData: ({commit}, payload) => {
            commit('receivedNewData', payload)
        }
    },
})