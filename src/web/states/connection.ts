import { atom, selector } from "recoil";
import { Connection } from "jsforce";

type ConnectionConfig = {
  accessToken?: string;
  instanceUrl?: string;
  loginUrl?: string;
  proxyUrl?: string;
};

export const connectionConfigState = atom<ConnectionConfig>({
  key: "connectionConfig",
  default: {},
});

export const connectionCredentialsState = atom<{
  username?: string | null;
  password?: string | null;
}>({
  key: "connectionCredential",
  default: {},
});

export const authorizedConnectionConfigState = selector<ConnectionConfig>({
  key: "authorizedConnectionConfigState",
  async get({ get }) {
    const config = get(connectionConfigState);
    if (config?.accessToken != null && config?.instanceUrl != null) {
      return config;
    }
    const { username, password } = get(connectionCredentialsState);
    const conn = new Connection(config);
    if (username && password) {
      await conn.login(username, password);
    }
    return {
      ...config,
      accessToken: conn.accessToken,
      instanceUrl: conn.instanceUrl,
    };
  },
});
