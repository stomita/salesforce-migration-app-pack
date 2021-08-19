import React from "react";
import { useUploadAction, useUploadStatus } from "../hooks/upload";
import { Button, Modal, ProgressBar } from "./Lightning";
import { UploadResultTables } from "./UploadResultTables";

/**
 *
 */
export const UploadProgressIndicator: React.FC = () => {
  const { uploadProgress, uploadResult } = useUploadStatus();
  const { onCompleteUpload } = useUploadAction();
  if (!uploadProgress && !uploadResult) {
    return <></>;
  }
  return (
    <Modal
      title={uploadProgress ? "Uploading..." : "Upload Completed"}
      onClose={onCompleteUpload}
      footer={
        uploadResult ? (
          <Button type="brand" onClick={onCompleteUpload}>
            OK
          </Button>
        ) : undefined
      }
    >
      {uploadProgress ? (
        <>
          <ProgressBar
            value={uploadProgress.successCount + uploadProgress.failureCount}
            minValue={0}
            maxValue={uploadProgress.totalCount}
          />
          <ul>
            <li>Total rows in input: {uploadProgress.totalCount}</li>
            <li>Successes: {uploadProgress.successCount}</li>
            <li>Failures: {uploadProgress.failureCount}</li>
          </ul>
        </>
      ) : undefined}
      {uploadResult ? (
        <>
          <UploadResultTables {...uploadResult} />
        </>
      ) : undefined}
    </Modal>
  );
};
