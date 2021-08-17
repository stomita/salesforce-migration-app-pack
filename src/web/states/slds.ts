import { atom } from "recoil";

type SLDSConfig = {
  assetRoot: string;
};

export const sldsConfigState = atom<SLDSConfig>({
  key: "sldsConfig",
  default: { assetRoot: "" },
});
