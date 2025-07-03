import * as signalR from '@microsoft/signalr';

export const hubConnection = new signalR.HubConnectionBuilder()
  .withUrl('http://localhost:8080/documenthub', {
    accessTokenFactory: () => localStorage.getItem('accessToken') || '',
    skipNegotiation: true,
    transport: signalR.HttpTransportType.WebSockets,
  })
  .configureLogging(signalR.LogLevel.Information)
  .build();

let isConnecting = false;

export const sendMessage = async (target: string, args: any[]) => {
  if (hubConnection.state !== signalR.HubConnectionState.Connected) {
    throw new Error('SignalR not connected');
  }

  await hubConnection.send(target, ...args);
};

export const startConnection = async () => {
  if (isConnecting || hubConnection.state !== signalR.HubConnectionState.Disconnected) return;
  isConnecting = true;
  try {
    await hubConnection.start();
    console.log('✅ SignalR connected');
  } catch (err) {
    console.error('❌ SignalR connection error:', err);
  } finally {
    isConnecting = false;
  }
};

export const stopConnection = async () => {
  if (hubConnection.state === signalR.HubConnectionState.Connected) {
    await hubConnection.stop();
    console.log('⛔ SignalR disconnected');
  }
};

// Автоматическая логика при обрывах
hubConnection.onclose(() => console.warn('⚠️ SignalR connection closed'));
hubConnection.onreconnecting(() => console.log('🔄 Reconnecting...'));
hubConnection.onreconnected(() => console.log('✅ Reconnected'));
