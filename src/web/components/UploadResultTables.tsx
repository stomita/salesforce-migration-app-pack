import React from "react";
import { UploadResult } from "salesforce-migration-automatic";
import { Tab, Tabs } from "./Lightning";

/**
 *
 */
type UploadResultTablesProps = UploadResult;

/**
 *
 */
const SuccessResultTable: React.FC<UploadResultTablesProps> = ({
  successes,
}) => {
  return (
    <table
      className="slds-table slds-table_cell-buffer slds-table_bordered"
      aria-labelledby="element-with-table-label other-element-with-table-label"
    >
      <thead>
        <tr className="slds-line-height_reset">
          <th className="" scope="col">
            <div className="slds-truncate" title="Object Name">
              Object Name
            </div>
          </th>
          <th className="" scope="col">
            <div className="slds-truncate" title="Original Id">
              Original Id
            </div>
          </th>
          <th className="" scope="col">
            <div className="slds-truncate" title="New Id">
              New Id
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {successes?.map(({ object, origId, newId }) => (
          <tr key={origId} className="slds-hint-parent">
            <th data-label="Object Name" scope="row">
              <div className="slds-truncate" title={object}>
                {object}
              </div>
            </th>
            <td data-label="Original Id">
              <div className="slds-truncate" title={origId}>
                {origId}
              </div>
            </td>
            <td data-label="New Id">
              <div className="slds-truncate" title={newId}>
                {newId}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

/**
 *
 */
const FailureResultTable: React.FC<UploadResultTablesProps> = ({
  failures,
}) => {
  return (
    <table
      className="slds-table slds-table_cell-buffer slds-table_bordered"
      aria-labelledby="element-with-table-label other-element-with-table-label"
    >
      <thead>
        <tr className="slds-line-height_reset">
          <th className="" scope="col">
            <div className="slds-truncate" title="Object Name">
              Object Name
            </div>
          </th>
          <th className="" scope="col">
            <div className="slds-truncate" title="Original Id">
              Original Id
            </div>
          </th>
          <th className="" scope="col">
            <div className="slds-truncate" title="Error">
              Error
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {failures?.map(({ object, origId, errors }) => (
          <tr key={origId} className="slds-hint-parent">
            <th data-label="Object Name" scope="row">
              <div className="slds-truncate" title={object}>
                {object}
              </div>
            </th>
            <td data-label="Original Id">
              <div className="slds-truncate" title={origId}>
                {origId}
              </div>
            </td>
            <td data-label="Error">
              {errors.map((error, i) => (
                <div key={i} className="slds-truncate" title={error.message}>
                  {error.message}
                </div>
              ))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

/**
 *
 */
const BlockedResultTable: React.FC<UploadResultTablesProps> = ({ blocked }) => {
  return (
    <table
      className="slds-table slds-table_cell-buffer slds-table_bordered"
      aria-labelledby="element-with-table-label other-element-with-table-label"
    >
      <thead>
        <tr className="slds-line-height_reset">
          <th className="" scope="col">
            <div className="slds-truncate" title="Object Name">
              Object Name
            </div>
          </th>
          <th className="" scope="col">
            <div className="slds-truncate" title="Original Id">
              Original Id
            </div>
          </th>
          <th className="" scope="col">
            <div className="slds-truncate" title="Blocking Field">
              Blocking Field
            </div>
          </th>
          <th className="" scope="col">
            <div className="slds-truncate" title="Blocking Id">
              Blocking Id
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {blocked?.map(({ object, origId, blockingField, blockingId }) => (
          <tr key={origId} className="slds-hint-parent">
            <th data-label="Object Name" scope="row">
              <div className="slds-truncate" title={object}>
                {object}
              </div>
            </th>
            <td data-label="Original Id">
              <div className="slds-truncate" title={origId}>
                {origId}
              </div>
            </td>
            <td data-label="Blocking Field">
              <div className="slds-truncate" title={blockingField}>
                {blockingField}
              </div>
            </td>
            <td data-label="Blocking Id">
              <div className="slds-truncate" title={blockingId}>
                {blockingId}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const UploadResultTables: React.FC<UploadResultTablesProps> = (
  props,
) => {
  const { successes, failures, blocked } = props;
  return (
    <Tabs defaultActiveKey={failures.length > 0 ? "failures" : "successes"}>
      <Tab tabKey="successes" title="Successes">
        <h2 className="slds-p-bottom_small">
          {successes.length} record{blocked.length > 1 ? "s" : ""} completed
          loading successfully.
        </h2>
        <div style={{ overflow: "auto", height: "50vh" }}>
          <SuccessResultTable {...props} />
        </div>
      </Tab>
      <Tab tabKey="failures" title="Failures">
        <h2 className="slds-p-bottom_small">
          {failures.length} record{blocked.length > 1 ? "s" : ""} failed with
          errors.
        </h2>
        <div style={{ overflow: "auto", height: "50vh" }}>
          <FailureResultTable {...props} />
        </div>
      </Tab>
      <Tab tabKey="blocked" title="Blocked">
        <h2 className="slds-p-bottom_small">
          {blocked.length} record{blocked.length > 1 ? "s are" : " is"} by
          dependencies on other records.
        </h2>
        <div style={{ overflow: "auto", height: "50vh" }}>
          <BlockedResultTable {...props} />
        </div>
      </Tab>
    </Tabs>
  );
};
