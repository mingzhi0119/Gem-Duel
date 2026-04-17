import { buildRoomServiceApp } from './app';

const app = await buildRoomServiceApp();
const port = Number(process.env.ROOM_SERVICE_PORT ?? 8787);

app.listen({ port, host: '0.0.0.0' }).catch((error) => {
    app.log.error(error);
    process.exit(1);
});
