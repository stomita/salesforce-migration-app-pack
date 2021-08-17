import React from "react";
import { useUploadAction, useUploadStatus } from "../hooks/upload";
import { Button, Modal } from "./Lightning";

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
        <ul>
          <li>Total records in input: {uploadProgress.totalCount}</li>
          <li>Successes: {uploadProgress.successCount}</li>
          <li>Failures: {uploadProgress.failureCount}</li>
        </ul>
      ) : undefined}
      {uploadResult ? (
        <ul>
          <li>Total records in input: {uploadResult.totalCount}</li>
          <li>Successes: {uploadResult.successes.length}</li>
          <li>Failures: {uploadResult.failures.length}</li>
          <li>Blocked: {uploadResult.blocked.length}</li>
        </ul>
      ) : undefined}
    </Modal>
  );
};
