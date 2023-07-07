<template>
   <div class="wrapper">
    <div class="sidebar">

      <span class="pi pi-sign-out" @click="logout"><br>Log-out</span>




      <div class="profile">
        <img src="@/assets/user.png" alt="">
        <h3>{{ username }}</h3>
        <p>Active</p>
        <div class="search-input">
        <input type="text" placeholder="Search" v-model="searchKeyword">
        <i class="pi pi-search"></i>
      </div>
      </div>

      <div class="contact_list_out_div">
        <div v-for="user in filteredUsersList" :key="user._id" class="contact_list" :class="{ active: isActive(user._id) }" @click="setActive(user._id, user.username)">
          <div class="contact_profile">
            <img src="@/assets/user.png" alt="">
            <div class="contact_details">
              <div class="name">{{ user.username }}</div>
              <div class="message">{{ latestMessages[user._id] }}</div>
            </div>
          </div>
        </div>
      </div>
   
    


    </div>
  
    <div class="content">
      <div class="header">
        <div class="profile">
          <img src="@/assets/user.png" alt="">
          <div class="contact_details">
            <div class="name">{{ selectedUsername }}</div>
              <div class="message active_status">Active status</div>
            </div>
          </div>
        </div>

        <div v-if="selectedUsername" class="chat-history" :key="selectedUsername" ref="chatHistory">
    <template v-for="message in sortedMessages" :key="message._id">
    <div :class="{ sent: isMessageSent(message.sender) }">
      <div class="profile" v-if="!isMessageSent(message.sender)">
        <!-- Profile image or other information -->
      </div>
      <div class="message-content" :class="{'senderout_div': isMessageSent(message.sender), 'recieverout_div': !isMessageSent(message.sender)}">
        <div class="text" :class="{sender: isMessageSent(message.sender), reciever: !isMessageSent(message.sender)}">{{ message.message }}</div>
      </div>
    </div>
  </template>
</div>




        <div v-else class="no-user-selected chat-history">
      No user selected
    </div>


        <div class="chat-input">
          <input v-model="newMessage" type="text" placeholder="Type a message" @keydown.enter="handleKeyDown">
  <button @click="sendMessage">Send</button>
</div>


  <!-- Display user ID, chat ID, and selected user's ID
  <div>User ID: {{ userId }}</div>
     <br>
      <div>Chat ID: {{ chatId }}</div>
      <br>
      <div>Selected User's ID: {{ selectedUserId }}</div> -->

      </div>

      <Toast />
    
    </div>

   
  </template>
  
  <script>
/* eslint-disable vue/multi-word-component-names */
import { useAuthStore } from '@/store';
import axios from 'axios';
import router from '../routes.js'

import Toast from "primevue/toast";
// import { ref, onMounted } from 'vue';
// import axios from 'axios';

export default {
  name: 'dashboard',
  components: {
      Toast, // Register the Toast component
    },

    setup(){
      function logout() {
      // Clear user authentication status
      sessionStorage.removeItem('isAuthenticated');
      router.push({ path: '/'});
    }
    return{
      logout,
    }

    },

  

  computed: {
    username() {
      const authStore = useAuthStore();
      return authStore.getUsername;
    },
    userId() {
      const authStore = useAuthStore();
      return authStore.getUserId;
    },
    chatId() {
      const authStore = useAuthStore();
      return authStore.getchatId;
    },

    filteredUsers() {
      const authStore = useAuthStore();
      const activeUsername = this.username;
      return authStore.chat_users.filter(user => user.username !== activeUsername);
    },

     sortedMessages() {
    const selectedUserMessages = this.selectedUserToCurrentUserMessages || [];
    const currentUserMessages = this.currentUserMessages || [];

    const messages = [...selectedUserMessages, ...currentUserMessages];

    return messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  },

  getLatestMessage(user) {
  const messages = [
    ...this.selectedUserToCurrentUserMessages,
    ...this.currentUserMessages,
  ];

  const latestMessage = messages
    .filter(
      (message) =>
        (message.sender === user._id && message.receiver === this.userId) ||
        (message.sender === this.userId && message.receiver === user._id)
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .shift();

  return latestMessage ? latestMessage.message : '';
},



latestMessages() {
    const latestMessages = {};

    const messages = [
      ...this.selectedUserToCurrentUserMessages,
      ...this.currentUserMessages,
    ];

    this.filteredUsers.forEach((user) => {
      const userMessages = messages.filter(
        (message) =>
          (message.sender === user._id && message.receiver === this.userId) ||
          (message.sender === this.userId && message.receiver === user._id)
      );

      if (userMessages.length > 0) {
        const latestMessage = userMessages
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .shift();

        latestMessages[user._id] = latestMessage.message;
      } else {
        latestMessages[user._id] = '';
      }
    });

    return latestMessages;
  },

  filteredUsersList() {
      const authStore = useAuthStore();
      const activeUsername = this.username;
      
      // Apply search filter when searchKeyword is not empty
      if (this.searchKeyword) {
        const lowercaseSearchKeyword = this.searchKeyword.toLowerCase();
        return authStore.chat_users.filter(user => {
          const lowercaseUsername = user.username.toLowerCase();
          return lowercaseUsername.includes(lowercaseSearchKeyword) && user.username !== activeUsername;
        });
      } else {
        // Display all users when searchKeyword is empty
        return authStore.chat_users.filter(user => user.username !== activeUsername);
      }
    },
  

  },












  

  mounted() {
  const authStore = useAuthStore();
  authStore.show_users().then(() => {
    console.log('ID of the currently logged-in user:', this.userId);
    console.log('Chat ID of the currently logged-in user:', this.chatId);
  });

  
  // Fetch messages initially
  this.fetchMessages();

  // Poll for new messages every few seconds
  setInterval(() => {
    this.fetchMessages();
  }, 1000); 

 
},


  data() {
    return {
      activeIndex: null,
      currentUserMessages: [],
      
    selectedUserToCurrentUserMessages: [],
      selectedUsername: '', // New data property to store the selected user's name
      newMessage: '',
      searchKeyword: ''
      
    };
  },



  methods: {



    handleKeyDown(event) {
      if (event.key === 'Enter') {
        event.preventDefault(); // Prevent line break in the input field

        // Check if the new message is not empty
        if (this.newMessage.trim() !== '') {
          this.sendMessage();
        }
      }
    },



    isActive(index) {
      return this.activeIndex === index;
    },


    setActive(index, username) {
  this.activeIndex = index;
  this.selectedUsername = username;

  const selectedUser = this.filteredUsers.find(user => user.username === username);
  if (selectedUser) {
    // Clear previous user's messages
    this.selectedUserToCurrentUserMessages = [];
    this.currentUserMessages = [];

    axios.get(`http://127.0.0.1:3000/chats/${selectedUser.chatId}/history`)
      .then(response => {
        const selectedUserMessages = response.data.messages;
        this.selectedUserToCurrentUserMessages = selectedUserMessages
          .filter(message => message.sender === this.userId || message.receiver === this.userId)
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Fetch current user's messages after selected user's messages have been fetched
        axios.get(`http://127.0.0.1:3000/chats/${this.chatId}/history`)
          .then(response => {
            const messages = response.data.messages;
            this.currentUserMessages = messages
              .filter(message => (message.sender === this.userId && message.receiver === selectedUser._id) || (message.sender === selectedUser._id && message.receiver === this.userId))
              .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

            // Scroll to the bottom of the chat history
            this.$nextTick(() => {
              const chatHistory = this.$refs.chatHistory;
              if (chatHistory) {
                chatHistory.scrollTop = chatHistory.scrollHeight;
              }
            });
          })
          .catch(error => {
            console.error('Error fetching messages:', error);
          });
      })
      .catch(error => {
        console.error('Error fetching messages of the selected user:', error);
      });
  } else {
    console.log('Selected user not found.');
  }
},




isMessageSent(sender) {
  const authStore = useAuthStore();
  return sender === authStore.getUserId;
},


sendMessage() {
  const chatId = this.chatId;
  const userId = this.userId;
  const selectedUser = this.filteredUsers.find(user => user.username === this.selectedUsername);

  if (!selectedUser) {
    this.$toast.add({
      severity: 'error',
      summary: 'Message Error',
      detail: 'Please select a recipient.',
      life: 3000,
    });
    console.error('Please select a recipient.');
    return;
  }

  const selectedUserId = selectedUser._id;
  const messageData = {
    sender: userId,
    receiver: selectedUserId,
    message: this.newMessage,
  };

  axios.post(`http://127.0.0.1:3000/chats/${chatId}/messages`, messageData)
    .then(response => {
      console.log('Message sent:', response.data);
      // Clear the input field after sending the message
      this.newMessage = '';

      // Fetch updated messages for the selected user
      axios.get(`http://127.0.0.1:3000/chats/${selectedUser.chatId}/history`)
        .then(response => {
          const selectedUserMessages = response.data.messages;
          this.selectedUserToCurrentUserMessages = selectedUserMessages
            .filter(message => message.sender === this.userId || message.receiver === this.userId)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

          // Scroll to the bottom of the chat history
          this.$nextTick(() => {
            const chatHistory = this.$refs.chatHistory;
            if (chatHistory) {
              chatHistory.scrollTop = chatHistory.scrollHeight;
            }
          });
        })
        .catch(error => {
          console.error('Error fetching messages of the selected user:', error);
        });

      // Fetch updated messages for the current user
      axios.get(`http://127.0.0.1:3000/chats/${this.chatId}/history`)
        .then(response => {
          const messages = response.data.messages;
          this.currentUserMessages = messages
            .filter(message => (message.sender === this.userId && message.receiver === selectedUser._id) || (message.sender === selectedUser._id && message.receiver === this.userId))
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

          // Scroll to the bottom of the chat history
          this.$nextTick(() => {
            const chatHistory = this.$refs.chatHistory;
            if (chatHistory) {
              chatHistory.scrollTop = chatHistory.scrollHeight;
            }
          });
        })
        .catch(error => {
          console.error('Error fetching messages:', error);
        });
    })
    .catch(error => {
      this.$toast.add({
        severity: 'error',
        summary: 'Message Error',
        detail: 'Please write your message',
        life: 3000,
      });
      console.error('Error sending message:', error);
    });
},





fetchMessages() {
  const selectedUser = this.filteredUsers.find(user => user.username === this.selectedUsername);
  if (selectedUser) {
    axios.get(`http://127.0.0.1:3000/chats/${selectedUser.chatId}/history`)
      .then(response => {
        const selectedUserMessages = response.data.messages;
        this.selectedUserToCurrentUserMessages = selectedUserMessages
          .filter(message => message.sender === this.userId || message.receiver === this.userId)
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Scroll to the bottom of the chat history
        this.$nextTick(() => {
          const chatHistory = this.$refs.chatHistory;
          if (chatHistory) {
            chatHistory.scrollTop = chatHistory.scrollHeight;
          }
        });
      })
      .catch(error => {
        console.error('Error fetching messages of the selected user:', error);
      });
  } else {
    console.log('Selected user not found.');
  }
},



    
  },

 
};

  </script>


<style src="@/assets/dashboard.css" scoped>
</style>