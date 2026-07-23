export interface IpcInvokePayload<T = unknown> {
  channel: string;
  payload: T;
  timestamp: string;
}

export interface IpcResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export type IpcChannel =
  | 'SYSTEM_PING'
  | 'GET_SYSTEM_INFO'
  | 'EXECUTE_AGENT_TASK'
  | 'FETCH_USER_PROFILE'
  | 'UPDATE_USER_SETTINGS';
