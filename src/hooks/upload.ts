import { Connection } from "jsforce";
import { useCallback } from "react";
import {
  useRecoilStateLoadable,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState,
} from "recoil";
import { AutoMigrator } from "salesforce-migration-automatic";
import { usePrevious } from "./common";
import { authorizedConnectionConfigState } from "../states/connection";
import { filesState, objectsState } from "../states/files";
import { appLoadingState } from "../states/app";
import {
  uploadProgressState,
  uploadResultState,
  uploadSettingsState,
} from "../states/upload";
import { useAlertControl } from "./alert";
import { useToastControl } from "./toast";

export function useUploadingEntries() {
  const files = useRecoilValue(filesState);
  const [loadable] = useRecoilStateLoadable(objectsState);
  const objects_ = loadable.state === "loading" ? null : loadable.getValue();
  const prevObjects = usePrevious(objects_);
  const objects = objects_ ?? prevObjects ?? new Map();
  return files.map((file) => ({
    ...file,
    ...objects.get(file.filename),
  }));
}

export function useUploadStatus() {
  const uploadProgress = useRecoilValue(uploadProgressState);
  const uploadResult = useRecoilValue(uploadResultState);
  return { uploadProgress, uploadResult };
}

export function useUploadAction() {
  const { mappings, options } = useRecoilValue(uploadSettingsState);
  const setUploadProgress = useSetRecoilState(uploadProgressState);
  const resetUploadProgress = useResetRecoilState(uploadProgressState);
  const setUploadResult = useSetRecoilState(uploadResultState);
  const resetUploadResult = useResetRecoilState(uploadResultState);
  const resetObjects = useResetRecoilState(objectsState);
  const connConfig = useRecoilValue(authorizedConnectionConfigState);
  const { showToast, hideToast } = useToastControl();
  const files = useRecoilValue(filesState);
  const onUploadData = useCallback(async () => {
    const uploadInputs = files.map(({ filename, data }) => ({
      object: filename.split(".")[0],
      csvData: data,
    }));
    console.log("start loading");
    hideToast();
    setUploadProgress({ totalCount: 0, successCount: 0, failureCount: 0 });
    try {
      const conn = new Connection(connConfig);
      const automig = new AutoMigrator(conn);
      automig.on("loadProgress", (state) => {
        console.log("loadProgress", state);
        setUploadProgress(state);
      });
      const result = await automig.loadCSVData(uploadInputs, mappings, options);
      setUploadResult(result);
      resetObjects();
    } catch (e) {
      showToast({ type: "error", message: e.message });
    } finally {
      console.log("loading completed");
      resetUploadProgress();
    }
  }, [
    files,
    hideToast,
    setUploadProgress,
    connConfig,
    mappings,
    options,
    setUploadResult,
    resetObjects,
    showToast,
    resetUploadProgress,
  ]);
  const onCompleteUpload = useCallback(
    () => resetUploadResult(),
    [resetUploadResult],
  );
  return { onUploadData, onCompleteUpload };
}

export function useDeleteRecordsAction() {
  const { showDialog, hideDialog } = useAlertControl();
  const { showToast } = useToastControl();
  const setAppLoading = useSetRecoilState(appLoadingState);
  const resetObjects = useResetRecoilState(objectsState);
  const connConfig = useRecoilValue(authorizedConnectionConfigState);
  const onDeleteRecordsConfirm = useCallback(
    async (objectName: string) => {
      hideDialog();
      const conn = new Connection(connConfig);
      setAppLoading(true);
      try {
        await conn.sobject(objectName).find().destroy();
        resetObjects();
      } catch (e) {
        showToast({ type: "error", message: e.message });
      } finally {
        setAppLoading(false);
      }
    },
    [connConfig, hideDialog, resetObjects, setAppLoading, showToast],
  );
  const onDeleteRecords = useCallback(
    (objectName: string) => {
      showDialog(
        `Deleting ALL existing records in ${objectName} object. Are you sure you want to delete records stored in Salesforce ?`,
        () => onDeleteRecordsConfirm(objectName),
      );
    },
    [onDeleteRecordsConfirm, showDialog],
  );
  return { onDeleteRecords };
}
