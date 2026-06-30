import Pusher from 'pusher';

const appId = process.env.PUSHER_APP_ID;
const key = process.env.PUSHER_KEY;
const secret = process.env.PUSHER_SECRET;
const cluster = process.env.PUSHER_CLUSTER;

const pusherServer = appId && key && secret && cluster
  ? new Pusher({ appId, key, secret, cluster, useTLS: true })
  : null;

export function triggerUserNotification(
  email: string,
  event: string,
  data: Record<string, unknown>
) {
  if (!pusherServer) return Promise.resolve(false);
  return pusherServer.trigger(`notifications-${email}`, event, data)
    .then(() => true)
    .catch((err) => {
      console.warn('Pusher notification error:', err);
      return false;
    });
}

export default pusherServer;
