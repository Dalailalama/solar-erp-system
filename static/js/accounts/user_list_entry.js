import { UserList } from './UserList.js';

const app = createApp({
    components: {
        UserList
    },
    template: '<user-list />'
});

app.use(ErpFramework);
app.mount('#user-list-container');


