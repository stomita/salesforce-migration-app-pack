import React, { Suspense } from "react";
import { MutableSnapshot, RecoilRoot } from "recoil";
import {
  connectionConfigState,
  connectionCredentialsState,
} from "../states/connection";
import { fileUrlsState } from "../states/files";
import { sldsConfigState } from "../states/slds";
import { App } from "../components/App";
import { Spinner } from "../components/Lightning";
import {
  RecordMappingPolicy,
  UploadOptions,
} from "salesforce-migration-automatic";
import { uploadSettingsState } from "../states/upload";

export type RootProps = {
  assetRoot?: string;
  accessToken?: string;
  instanceUrl?: string;
  loginUrl?: string;
  proxyUrl?: string;
  username?: string;
  password?: string;
  fileUrls: string[];
  mappings?: RecordMappingPolicy[];
  options?: UploadOptions;
};

export const Root: React.FC<RootProps> = (props) => {
  const {
    assetRoot = "",
    accessToken,
    instanceUrl = "/",
    loginUrl,
    proxyUrl,
    username,
    password,
    fileUrls,
    mappings,
    options,
  } = props;
  const initializeState = ({ set }: MutableSnapshot) => {
    set(sldsConfigState, { assetRoot });
    set(connectionConfigState, {
      accessToken,
      instanceUrl,
      loginUrl,
      proxyUrl,
    });
    set(connectionCredentialsState, { username, password });
    set(fileUrlsState, fileUrls);
    set(uploadSettingsState, { mappings, options });
  };
  return (
    <RecoilRoot initializeState={initializeState}>
      <Suspense fallback={<Spinner />}>
        <App />
      </Suspense>
    </RecoilRoot>
  );
};
