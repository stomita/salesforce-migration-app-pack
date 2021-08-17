import React from "react";
import { useDeleteRecordsAction, useUploadingEntries } from "../hooks/upload";

/**
 *
 */
export const UploadFileTable: React.FC = () => {
  const entries = useUploadingEntries();
  const { onDeleteRecords } = useDeleteRecordsAction();
  return (
    <table
      className="slds-table slds-table_cell-buffer slds-table_bordered"
      aria-labelledby="element-with-table-label other-element-with-table-label"
    >
      <thead>
        <tr className="slds-line-height_reset">
          <th className="" scope="col">
            <div className="slds-truncate" title="File Name">
              File Name
            </div>
          </th>
          <th className="" scope="col">
            <div className="slds-truncate" title="Object Name">
              Object Name
            </div>
          </th>
          <th className="" scope="col">
            <div className="slds-truncate" title="Stored Record Count">
              Stored Record Count
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {entries?.map(({ filename, object, count }) => (
          <tr key={filename} className="slds-hint-parent">
            <th data-label="File Name" scope="row">
              <div className="slds-truncate" title={filename}>
                <a href="#" tabIndex={-1}>
                  {filename}
                </a>
              </div>
            </th>
            <td data-label="Object Name">
              <div className="slds-truncate" title={object}>
                {object}
              </div>
            </td>
            <td data-label="Stored Record Count">
              <span>{count ?? "-"}</span>
              <span className="slds-p-left_medium">
                (<a onClick={() => onDeleteRecords(object)}>Delete</a>)
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
