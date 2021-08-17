import { atom } from "recoil";

type AlertMessage = {
  type: "alert" | "confirm";
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export const alertMessageState = atom<AlertMessage | null>({
  key: "alertMessage",
  default: null,
});
