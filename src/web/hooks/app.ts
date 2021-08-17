import { useRecoilValue } from "recoil";
import { appLoadingState } from "../states/app";

export function useAppLoading() {
  return useRecoilValue(appLoadingState);
}
