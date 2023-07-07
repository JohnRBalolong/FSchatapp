<template>
    <header>
      <a href="" class="logo">Coders Chat</a>
  
      <div class="main">
        <button class="button uil uil-user" id="form-open">Login</button>
      </div>
    </header>
  
    <section class="home">
      <div class="form_container">
        <i class="uil uil-times form_close"></i>
        <!-- Login-form -->
        <div class="from login_form">
          
            <h2>Login</h2>
  
            <div class="input_box">
              <input type="text" placeholder="Enter your Username" v-model="login_username">
              <i class="uil uil-envelope-alt email"></i>
            </div>
            <div class="input_box">
              <input type="password" placeholder="Enter your password" v-model="login_password">
              <i class="uil uil-lock password"></i>
              <i class="uil uil-eye-slash pw_hide"></i>
            </div>
  
            <div class="option_field">
              <span class="checkbox">
                <input id="check" type="checkbox">
                <label for="check">Remember me</label>
              </span>
              <a href="#" class="forgot_pw">Forgot password</a>
            </div>
  
            <button class="button" @click="GoLogin">Login</button>
  
            <div class="login_signup">
              Don't have an Account? <a href="#" id="signup">Signup</a>
            </div>
          
        </div>
  
        <!-- Sign-up form -->
        <div class="from signup_form">
          <h2>Sign Up</h2>
  
          <div class="input_box">
            <input type="text" placeholder="Username" v-model="username" :key="'username'">
            <i class="uil uil-user user"></i>
          </div>
  
          <div class="input_box">
            <input type="email" placeholder="Enter your email" v-model="email" :key="'email'">
            <i class="uil uil-envelope-alt email"></i>
          </div>
          <div class="input_box">
            <input type="password" placeholder="Create your password" v-model="password" :key="'password'">
            <i class="uil uil-lock password"></i>
            <i class="uil uil-eye-slash pw_hide"></i>
          </div>
          <div class="input_box">
            <input type="password" placeholder="Confirm your password" v-model="conpass" :key="'confirm-password'">
            <i class="uil uil-lock password"></i>
            <i class="uil uil-eye-slash pw_hide"></i>
          </div>
  
          <button class="button" @click="submit">Signup</button>
  
          <div classclass="login_signup">Already have an Account? <a href="#" id="login">Login</a></div>
        </div>
      </div>
  
      <Toast />
    </section>
  </template>
  
  <script>
  /* eslint-disable vue/multi-word-component-names */
  import { ref, computed } from "vue";
  import { useToast } from "primevue/usetoast";
  import axios from "axios";
  import Toast from "primevue/toast";
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/store';

  export default {
    name: 'index',
    components: {
      Toast, // Register the Toast component
    },

  

  
    setup() {
      const toast = useToast();
      const login_username = ref("");
      const login_password = ref("");
      const username = ref("");
      const password = ref("");
      const email = ref("");
      const conpass =ref("");
      const router = useRouter();
      const authStore = useAuthStore();

    //   Registration function
    const submit = async () => {
  if (
    !username.value ||
    !email.value ||
    !password.value ||
    !conpass.value ||
    conpass.value !== password.value
  ) {
    // Handle client-side validation errors if necessary
    return;
  }

  try {
    const response = await axios.post("http://127.0.0.1:3000/register", {
      username: username.value,
      email: email.value,
      password: password.value,
    });

    toast.add({
      severity: 'success',
      summary: 'Registered Successfully',
      detail: response.data.message,
      life: 3000,
    });

    // Clear input fields and switch to login form
    username.value = "";
    password.value = "";
    email.value = "";
    conpass.value = "";

    const formContainer = document.querySelector(".form_container");
    formContainer.classList.remove("active");
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      // Display server-side validation errors
      const errorMessages = error.response.data.errors.map(error => error.msg);
      toast.add({
        severity: 'error',
        summary: 'Registration Error',
        detail: errorMessages.join(', '),
        life: 5000,
      });
    } else if (error.response && error.response.data && error.response.data.error) {
      // Display other server-side errors
      const errorMessage = error.response.data.error;
      toast.add({
        severity: 'error',
        summary: 'Registration Error',
        detail: errorMessage,
        life: 5000,
      });
    } else {
      // Handle other errors
      toast.add({
        severity: 'error',
        summary: 'Registration Error',
        detail: error.message,
        life: 5000,
      });
    }
  }
};




      
// Login function
const GoLogin = async () => {

    if ( !login_username.value ||
    
    !login_password.value) {
      toast.add({
        severity: 'error',
        summary: 'Login Error',
        detail: 'Invalid account',
        life: 3000,
      });
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:3000/login", {
        username: login_username.value,
        password: login_password.value,
      });

      toast.add({
        severity: 'success',
        summary: 'Login Successful',
        detail: response.data.message,
        life: 3000,
      });

     


      setTimeout(() => {
          sessionStorage.setItem('isAuthenticated', true);
          // Save user session in the store
          authStore.login(login_username.value); // Pass the username value
        //   console.log(login_username.value);
        console.log(authStore.user); // Check the user object
          router.push({ name: 'dashboard' }); 
        }, 1000);
 


    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        const errorMessage = error.response.data.error;
        toast.add({
          severity: 'error',
          summary: 'Login Error:',
          detail: errorMessage,
          life: 5000,
        });
      } else {
        toast.add({
          severity: 'error',
          summary: 'Login Error:',
          detail: error.message,
          life: 5000,
        });
      }
    }
  };



      return {
        login_username,
        login_password,
        username,
        password,
        email,
        conpass,
        submit,
        GoLogin,
        getUsername: computed(() => authStore.user ? authStore.user.username : ''),

      };
    },



    mounted() {
      const formOpenBtn = document.querySelector("#form-open");
      const home = document.querySelector(".home");
      const formContainer = document.querySelector(".form_container");
      const formCloseBtn = document.querySelector(".form_close");
      const signupBtn = document.querySelector("#signup");
      const loginBtn = document.querySelector("#login");
      const pwShowHide = document.querySelectorAll(".pw_hide");
  
      formOpenBtn.addEventListener("click", () => home.classList.add("show"));
      formCloseBtn.addEventListener("click", () =>
        home.classList.remove("show")
      );
  
      pwShowHide.forEach((icon) => {
        icon.addEventListener("click", () => {
          let getPwInput = icon.parentElement.querySelector("input");
          if (getPwInput.type === "password") {
            getPwInput.type = "text";
            icon.classList.replace("uil-eye-slash", "uil-eye");
          } else {
            getPwInput.type = "password";
            icon.classList.replace("uil-eye", "uil-eye-slash");
          }
        });
      });
  
      signupBtn.addEventListener("click", (e) => {
        e.preventDefault();
        formContainer.classList.add("active");
      });
  
      loginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        formContainer.classList.remove("active");
      });
    }
  };
  </script>
  
  <style src="@/assets/index.css" scoped>
  </style>
  