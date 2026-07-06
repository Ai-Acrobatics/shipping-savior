import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { api } from './api';

const PUSH_TOKEN_KEY = 'ss.push.token';

// Show alerts even when the app is foregrounded — a cutoff alarm must never
// be silently swallowed because the user happens to have the app open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Registers this device for shipment/cutoff alert pushes. Safe to call on
// every login: the server upserts on the token. Silently no-ops on
// simulators, Expo Go, or when the user denies permission.
export async function registerForPushNotifications(): Promise<void> {
  if (!Device.isDevice) return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (status !== 'granted') return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('shipments', {
      name: 'Shipment alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0ea5e9',
    });
  }

  const projectId =
    Constants.easConfig?.projectId ??
    (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)
      ?.eas?.projectId;
  if (!projectId) return; // not linked to an EAS project yet (e.g. Expo Go)

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });

  await api('/api/mobile/devices', {
    method: 'POST',
    body: {
      token,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
      deviceName: Device.deviceName ?? undefined,
    },
  });
  await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
}

export async function unregisterPushToken(): Promise<void> {
  const token = await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
  if (!token) return;
  await api('/api/mobile/devices', { method: 'DELETE', body: { token } });
  await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
}
