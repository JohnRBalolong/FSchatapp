import { createApp } from 'vue';
import App from './App.vue';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import router from './routes';
import { createPinia } from 'pinia';

import 'primevue/resources/themes/saga-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(PrimeVue);
app.use(ToastService); // Register ToastService

app.use(router);

app.mount('#app');