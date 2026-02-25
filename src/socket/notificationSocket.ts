import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let client: Client | null = null;

export function connectNotificationSocket(onMessage: (data: any) => void) {
  if (client?.active) return;

  client = new Client({
    webSocketFactory: () => new SockJS("http://13.39.80.27:8080/ws"),
    reconnectDelay: 5000,
    onConnect: () => {
      client!.subscribe("/user/queue/notifications", (msg) => {
        onMessage(JSON.parse(msg.body));
      });
    },
  });

  client.activate();
}

export function disconnectNotificationSocket() {
  client?.deactivate();
}