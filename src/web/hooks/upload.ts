import { Connection } from "jsforce";
import { useCallback } from "react";
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from "recoil";
import { AutoMigrator } from "salesforce-migration-automatic";
import { useLatestRecoilValue } from "./common";
import { authorizedConnectionConfigState } from "../states/connection";
import { filesState } from "../states/files";
import { appLoadingState } from "../states/app";
import {
  uploadProgressState,
  uploadResultState,
  uploadSettingsState,
} from "../states/upload";
import { useAlertControl } from "./alert";
import { useToastControl } from "./toast";
import { isNotNullOrUndefined } from "../../util";
import { objectsState, uploadInputRefsState } from "../states/input";

export function useUploadEntries() {
  const uploadInputRefs = useRecoilValue(uploadInputRefsState);
  const objects = useLatestRecoilValue(objectsState, new Map());
  const files = useLatestRecoilValue(filesState, []);
  return uploadInputRefs.map(({ fileIndex, object, ...input }) => {
    const file = files[fileIndex] ?? { filename: "", url: "" };
    const obj = objects.get(object);
    return { object, ...input, ...file, ...obj };
  });
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
  const entries = useUploadEntries();
  const onUploadData = useCallback(async () => {
    const uploadInputs = entries
      .map(({ data, ...input }) => (data ? { ...input, csvData: data } : null))
      .filter(isNotNullOrUndefined);
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
    entries,
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
        const recs = await conn.sobject(objectName).find({}, "Id");
        const ids = recs.map((r) => r.Id as string);
        await conn
          .sobject(objectName)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .destroy(ids, { allowRecursive: true } as any);
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
