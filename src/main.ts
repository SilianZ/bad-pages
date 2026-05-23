import { createApp as Silian_createApp } from 'vue';
import Silian_PrimeVue from 'primevue/config';
import Silian_Aura from '@primeuix/themes/aura';
import Silian_App from './App.vue';
import Silian_router from './router';
import 'primeicons/primeicons.css';
const Silian_app = Silian_createApp(Silian_App);
Silian_app.use(Silian_PrimeVue, {
    theme: {
        preset: Silian_Aura,
        options: {
            darkModeSelector: false
        }
    }
});
Silian_app.use(Silian_router);
Silian_app.mount('#app');
