import React from "react";
import { render } from "react-dom";
import { Root } from "./containers/Root";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const migrationAppPackConfig = (window as any).migrationAppPackConfig;
if (process.env.SF_USERNAME && process.env.SF_PASSWORD) {
  migrationAppPackConfig.username = process.env.SF_USERNAME;
  migrationAppPackConfig.password = process.env.SF_PASSWORD;
  migrationAppPackConfig.loginUrl = process.env.SF_LOGIN_URL;
  migrationAppPackConfig.proxyUrl = process.env.SF_AJAX_PROXY;
}
console.log(migrationAppPackConfig);
render(<Root {...migrationAppPackConfig} />, document.getElementById("root"));
