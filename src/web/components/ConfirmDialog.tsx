import React from "react";
import { useAlertControl, useAlertMessage } from "../hooks/alert";
import { Button, Modal } from "./Lightning";

/**
 *
 */
export const ConfirmDialog: React.FC = () => {
  const alert = useAlertMessage();
  const { hideDialog } = useAlertControl();
  if (!alert) {
    return <></>;
  }
  const { type, message, onConfirm } = alert;
  return (
    <Modal
      onClose={hideDialog}
      footer={
        <>
          {type === "confirm" ? (
            <Button type="neutral" onClick={hideDialog}>
              Cancel
            </Button>
          ) : undefined}
          <Button type="brand" onClick={onConfirm}>
            OK
          </Button>
        </>
      }
    >
      {message}
    </Modal>
  );
};
