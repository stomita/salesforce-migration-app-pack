import { Connection } from "jsforce";
import { atom, selector } from "recoil";
import { UploadInput } from "salesforce-migration-automatic";
import { isNotNullOrUndefined } from "../../util";
import { authorizedConnectionConfigState } from "./connection";

export type UploadInputRef = Omit<UploadInput, "csvData"> & { fileIndex: 0 };

export const uploadInputRefsState = atom<UploadInputRef[]>({
  key: "uploadInputRefs",
  default: [],
});

const timestampState = atom({
  key: "timestamp",
  default: Date.now(),
});

export const objectsState = selector({
  key: "objects",
  async get({ get }) {
    get(timestampState);
    const uploadInputRefs = get(uploadInputRefsState);
    const connConfig = get(authorizedConnectionConfigState);
    const conn = new Connection(connConfig);
    return new Map(
      (
        await Promise.all(
          uploadInputRefs.map(async ({ object }) => {
            try {
              const count = await conn.sobject(object).count();
              return [object, { object, count }] as const;
            } catch (e) {
              return null;
            }
          }),
        )
      ).filter(isNotNullOrUndefined),
    );
  },
  set({ set }) {
    set(timestampState, Date.now());
  },
});
