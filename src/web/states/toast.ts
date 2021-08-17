import { atom } from "recoil";

export type ToastMessage = {
  pid: NodeJS.Timeout;
  type: "error" | "warning" | "success";
  message: string;
};

export const toastMessageState = atom<ToastMessage | null>({
  key: "toastMessage",
  default: null,
});
