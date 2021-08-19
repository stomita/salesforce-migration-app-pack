import React from "react";
import { useAppLoading } from "../hooks/app";
import { useToastControl, useToastMessage } from "../hooks/toast";
import { useUploadAction } from "../hooks/upload";
import { ConfirmDialog } from "./ConfirmDialog";
import { Button, Card, Toast, Spinner } from "./Lightning";
import { UploadEntriesTable } from "./UploadEntriesTable";
import { UploadProgressIndicator } from "./UploadProgressIndicator";

/**
 *
 */
const AppToast: React.FC = () => {
  const toast = useToastMessage();
  const { hideToast, freezeToast } = useToastControl();
  if (!toast) {
    return <></>;
  }
  const { type, message } = toast;
  return (
    <div style={{ position: "absolute", top: 0, width: "100%", zIndex: 1000 }}>
      <Toast type={type} onClick={freezeToast} onClose={hideToast}>
        {message}
      </Toast>
    </div>
  );
};

/**
 *
 */
const AppLoadingSpinner: React.FC = () => {
  const loading = useAppLoading();
  if (!loading) {
    return <></>;
  }
  return <Spinner />;
};

/**
 *
 */
export const App: React.FC = () => {
  const { onUploadData } = useUploadAction();
  const footer = (
    <Button type="brand" onClick={onUploadData}>
      Load Data
    </Button>
  );
  return (
    <>
      <Card title="Load CSV Data as Records" footer={footer}>
        <UploadEntriesTable />
      </Card>
      <UploadProgressIndicator />
      <ConfirmDialog />
      <AppLoadingSpinner />
      <AppToast />
    </>
  );
};
