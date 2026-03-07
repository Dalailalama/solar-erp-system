import { Settings } from './Settings.js';

const app = createApp({
    components: {
        Settings
    },
    template: '<settings />'
});

app.use(ErpFramework);
app.mount('#settings-container');


