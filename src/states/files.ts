import { Connection } from "jsforce";
import { atom, selector } from "recoil";
import { authorizedConnectionConfigState } from "./connection";

export const fileUrlsState = atom<string[]>({
  key: "fileUrls",
  default: [],
});

const timestampState = atom({
  key: "timestamp",
  default: Date.now(),
});

export const filesState = selector({
  key: "files",
  async get({ get }) {
    const fileUrls = get(fileUrlsState);
    return Promise.all(
      fileUrls.map(async (fileUrl) => {
        const filename = fileUrl.split("/").pop() ?? "";
        const res = await fetch(fileUrl);
        const data = await res.text();
        return { filename, url: fileUrl, data };
      }),
    );
  },
});

export const objectsState = selector({
  key: "objects",
  async get({ get }) {
    get(timestampState);
    const files = get(filesState);
    const connConfig = get(authorizedConnectionConfigState);
    const conn = new Connection(connConfig);
    return new Map(
      await Promise.all(
        files.map(async ({ filename }) => {
          const object = filename.split(".")[0];
          const count = await conn.sobject(object).count();
          return [filename, { object, count }] as const;
        }),
      ),
    );
  },
  set({ set }) {
    set(timestampState, Date.now());
  },
});
