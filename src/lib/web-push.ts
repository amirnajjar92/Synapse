import webPush from 'web-push';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const mailto = process.env.VAPID_MAILTO || 'mailto:admin@synapse.app';

const webPushInstance = publicKey && privateKey
  ? (webPush.setVapidDetails(mailto, publicKey, privateKey), webPush)
  : null;

export default webPushInstance;
