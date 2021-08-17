import { useCallback } from "react";
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from "recoil";
import { alertMessageState } from "../states/alert";

export function useAlertMessage() {
  return useRecoilValue(alertMessageState);
}

export function useAlertControl() {
  const setAlertMessage = useSetRecoilState(alertMessageState);
  const resetAlertMessage = useResetRecoilState(alertMessageState);
  const hideDialog = useCallback(
    () => resetAlertMessage(),
    [resetAlertMessage],
  );
  const showDialog = useCallback(
    (message: string, onConfirm?: () => void) => {
      setAlertMessage({
        type: "confirm",
        message,
        onConfirm,
        onCancel: hideDialog,
      });
    },
    [hideDialog, setAlertMessage],
  );
  return { showDialog, hideDialog };
}
