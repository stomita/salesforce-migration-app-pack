import React from "react";
import { formatNumber } from "../../util";
import { useDeleteRecordsAction, useUploadEntries } from "../hooks/upload";

/**
 *
 */
export const UploadEntriesTable: React.FC = () => {
  const entries = useUploadEntries();
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
            <div className="slds-truncate" title="Num of Loading Rows">
              Num of Loading Rows
            </div>
          </th>
          <th className="" scope="col">
            <div className="slds-truncate" title="Object Name">
              Object Name
            </div>
          </th>
          <th className="" scope="col">
            <div className="slds-truncate" title="Num of Existing Records">
              Num of Existing Records
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {entries?.map(({ url, filename, rows, object, count }) => (
          <tr key={object} className="slds-hint-parent">
            <th data-label="File Name" scope="row">
              <div className="slds-truncate" title={filename}>
                {rows ? (
                  <a href={url} tabIndex={-1}>
                    {filename}
                  </a>
                ) : (
                  filename
                )}
              </div>
            </th>
            <td data-label="Num of Loading Rows">
              <div className="slds-truncate" title={object}>
                {formatNumber(rows?.length)}
              </div>
            </td>
            <td data-label="Object Name">
              <div className="slds-truncate" title={object}>
                {object}
              </div>
            </td>
            <td data-label="Num of Existing Records">
              <span>{formatNumber(count)}</span>
              {object && count ? (
                <span className="slds-p-left_medium">
                  (<a onClick={() => onDeleteRecords(object)}>Delete</a>)
                </span>
              ) : undefined}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
