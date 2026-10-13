import { io } from 'socket.io-client';
import { socketService } from '../socketService';
import { tokenStorage } from '../../features/auth/services/tokenStorage';

jest.mock('socket.io-client');
jest.mock('../../features/auth/services/tokenStorage', () => ({
  tokenStorage: {
    getAccess: jest.fn(),
  },
}));

describe('SocketService', () => {
  const mockSocket = {
    connected: false,
    disconnect: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSocket.connected = false;
    (io as jest.Mock).mockReturnValue(mockSocket);
    socketService.disconnect();
  });

  it('connects with JWT auth token from tokenStorage', async () => {
    (tokenStorage.getAccess as jest.Mock).mockResolvedValue('test-jwt-token');

    await socketService.connect();

    expect(tokenStorage.getAccess).toHaveBeenCalledTimes(1);
    expect(io).toHaveBeenCalledWith(
      expect.stringContaining('/notifications'),
      expect.objectContaining({
        transports: ['websocket'],
        auth: { token: 'test-jwt-token' },
        reconnection: true,
      })
    );
  });

  it('does not connect if no token is available', async () => {
    (tokenStorage.getAccess as jest.Mock).mockResolvedValue(null);

    await socketService.connect();

    expect(io).not.toHaveBeenCalled();
  });

  it('does not create new socket if already connected', async () => {
    (tokenStorage.getAccess as jest.Mock).mockResolvedValue('token-1');
    mockSocket.connected = true;

    // Connect once
    await socketService.connect();
    expect(io).toHaveBeenCalledTimes(1);

    // Call connect again while connected
    await socketService.connect();
    expect(io).toHaveBeenCalledTimes(1);
  });

  it('disconnects and cleans up socket', async () => {
    (tokenStorage.getAccess as jest.Mock).mockResolvedValue('token-1');
    await socketService.connect();

    socketService.disconnect();

    expect(mockSocket.disconnect).toHaveBeenCalled();
    expect(socketService.isConnected()).toBe(false);
  });

  it('registers and removes event listeners', async () => {
    (tokenStorage.getAccess as jest.Mock).mockResolvedValue('token-1');
    await socketService.connect();

    const listener = jest.fn();
    socketService.on('notification:new', listener);
    expect(mockSocket.on).toHaveBeenCalledWith('notification:new', listener);

    socketService.off('notification:new', listener);
    expect(mockSocket.off).toHaveBeenCalledWith('notification:new', listener);
  });

  it('emits events through socket', async () => {
    (tokenStorage.getAccess as jest.Mock).mockResolvedValue('token-1');
    await socketService.connect();

    socketService.emit('test:event', { data: 123 });
    expect(mockSocket.emit).toHaveBeenCalledWith('test:event', { data: 123 });
  });
});
