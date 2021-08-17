import { useRecoilValue } from "recoil";
import { sldsConfigState } from "../states/slds";

export function useSLDSConfig() {
  return useRecoilValue(sldsConfigState);
}
