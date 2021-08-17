import { atom } from "recoil";
import {
  UploadProgress,
  UploadResult,
  RecordMappingPolicy,
  UploadOptions,
} from "salesforce-migration-automatic";

export const uploadSettingsState = atom<{
  mappings?: RecordMappingPolicy[];
  options?: UploadOptions;
}>({
  key: "uploadSettings",
  default: {},
});

export const uploadProgressState = atom<UploadProgress | null>({
  key: "uploadProgress",
  default: null,
});

export const uploadResultState = atom<UploadResult | null>({
  key: "uploadResult",
  default: null,
});
