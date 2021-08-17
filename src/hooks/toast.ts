import { useCallback } from "react";
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from "recoil";
import { ToastMessage, toastMessageState } from "../states/toast";

export function useToastMessage() {
  return useRecoilValue(toastMessageState);
}

export function useToastControl() {
  const setToastMessage = useSetRecoilState(toastMessageState);
  const showToast = useRecoilCallback(
    ({ snapshot }) =>
      async (msg: Omit<ToastMessage, "pid">) => {
        let pid = (await snapshot.getPromise(toastMessageState))?.pid;
        if (pid) {
          clearTimeout(pid);
        }
        pid = setTimeout(() => {
          setToastMessage(null);
        }, 5000);
        setToastMessage({ ...msg, pid });
      },
    [setToastMessage],
  );
  const hideToast = useCallback(() => {
    setToastMessage(null);
  }, [setToastMessage]);
  const freezeToast = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        const pid = (await snapshot.getPromise(toastMessageState))?.pid;
        if (pid) {
          clearTimeout(pid);
        }
      },
    [],
  );
  return { showToast, hideToast, freezeToast };
}
