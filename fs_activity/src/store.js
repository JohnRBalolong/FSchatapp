import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(sessionStorage.getItem('user')) || { username: '', id: '' },
        chat_users: [],
    }),
    getters: {
        isLoggedIn: (state) => !!state.user.username,
        getUsername: (state) => state.user.username,
        getUserId: (state) => state.user.id,
        getchatId: (state) => state.user.chatId,
    },
    actions: {
        login(username) {
            this.user = { username, id: '' }; // Set the initial ID to an empty string
            sessionStorage.setItem('user', JSON.stringify(this.user));
        },
        logout() {
            this.user = { username: '', id: '' }; // Clear the ID on logout
            sessionStorage.removeItem('user');
        },
        async show_users() {
            try {
                const response = await axios.get('http://127.0.0.1:3000/users');
                this.chat_users = response.data;

                const loggedInUsername = this.user.username;
                const loggedInUser = this.chat_users.find(user => user.username === loggedInUsername);

                if (loggedInUser) {
                    this.user = {...this.user, id: loggedInUser._id, chatId: loggedInUser.chatId }; // Update the ID and chatId
                    console.log('ID of the currently logged-in user:', loggedInUser._id);
                    console.log('Chat ID of the currently logged-in user:', loggedInUser.chatId);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        },

    },
});