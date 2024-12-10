import { initServer } from "./app"


const init = async () => {
    const app = await initServer();
    app.listen(8000, () => {console.log('Server is started at 8000 port')})
}

init();