import fs from "fs-extra";
import path from "path";
import AdmZip from "adm-zip";
import { Connection } from "jsforce";
import {
  RecordMappingPolicy,
  UploadInput,
  UploadOptions,
} from "salesforce-migration-automatic";

function randid() {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function buildUploadPage(
  staticResourceName: string,
  inputs: UploadInput[],
  mappings: RecordMappingPolicy[] = [],
  options: UploadOptions = {},
) {
  return `
<apex:page docType="html-5.0"
	sidebar="false"
	cache="true"
	title="Migration Data Upload"
>
<apex:slds />
<div id="root"></div>
<script>
window.migrationAppPackConfig = {
	accessToken: '{!$Api.Session_Id}',
	instanceUrl: '{!$Site.Prefix}',
	assetRoot: '{!URLFOR($Asset.SLDS)}',
	fileUrls: [
		${inputs
      .map(
        (input) =>
          `"{!URLFOR($Resource.${staticResourceName}, 'data/${input.object}.csv')}"`,
      )
      .join(",\n    ")}
	],
	mappings: {!JSENCODE('${JSON.stringify(mappings)}')},
	options: {!JSENCODE('${JSON.stringify(options)}')}
};
</script>
<script src="{!URLFOR($Resource.${staticResourceName}, 'scripts/migration-app-pack.js')}"></script> 
</apex:page>
	`.trim();
}

function buildUploadPageXml(visualforcePageName: string, apiVersion: string) {
  return `
<?xml version="1.0" encoding="UTF-8"?>
<ApexPage xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>${apiVersion}</apiVersion>
    <availableInTouch>false</availableInTouch>
    <confirmationTokenRequired>false</confirmationTokenRequired>
		<label>${visualforcePageName}</label>
</ApexPage>
	`.trim();
}

async function buildStaticResource(inputs: UploadInput[]) {
  const resZip = new AdmZip();
  const webappScriptName = "migration-app-pack.js";
  const webappScriptFile = path.join(__dirname, "../../dist", webappScriptName);
  resZip.addFile(
    `scripts/${webappScriptName}`,
    await fs.readFile(webappScriptFile),
  );
  for (const input of inputs) {
    resZip.addFile(`data/${input.object}.csv`, Buffer.from(input.csvData));
  }
  return resZip.toBuffer();
}

function buildStaticResourceXml() {
  return `
<?xml version="1.0" encoding="UTF-8"?>
<StaticResource xmlns="http://soap.sforce.com/2006/04/metadata">
    <cacheControl>Private</cacheControl>
    <contentType>application/zip</contentType>
</StaticResource>
`.trim();
}

function buildPackageXml(
  types: Array<{ name: string; members: string[] }>,
  packageName: string,
  apiVersion = "50.0",
) {
  return `
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
		${types
      .map(
        ({ name, members }) =>
          `<types>
				<name>${name}</name>
        ${members
          .map((member) => `<members>${member}</members>`)
          .join("\n        ")}
	  </types>`,
      )
      .join("\n    ")}
	  <version>${apiVersion}</version>
	  <fullName>${packageName}</fullName>
</Package>
	`.trim();
}

/**
 *
 */
export async function createPackage(
  conn: Connection,
  inputs: UploadInput[],
  mappings?: RecordMappingPolicy[],
  options?: UploadOptions,
) {
  const packid = randid();
  const packagePrefix = `MigrationApp_${packid}`;
  const packageName = `Migration App (${packid})`;
  const staticResourceName = `${packagePrefix}_Files`;
  const vfPageName = `${packagePrefix}_UploadPage`;
  const vfPageLabel = `Migration Data Upload Page (${packid})`;

  const pkgZip = new AdmZip();
  // Visualforce Page
  const vfPageContent = buildUploadPage(
    staticResourceName,
    inputs,
    mappings,
    options,
  );
  pkgZip.addFile(
    path.join("pages", `${vfPageName}.page`),
    Buffer.from(vfPageContent),
  );
  const vfPageXml = buildUploadPageXml(vfPageLabel, conn.version);
  pkgZip.addFile(
    path.join("pages", `${vfPageName}.page-meta.xml`),
    Buffer.from(vfPageXml),
  );
  // Static Resource
  const staticResource = await buildStaticResource(inputs);
  pkgZip.addFile(
    path.join("staticresources", `${staticResourceName}.resource`),
    staticResource,
  );
  const staticResourceXml = await buildStaticResourceXml();
  pkgZip.addFile(
    path.join("staticresources", `${staticResourceName}.resource-meta.xml`),
    Buffer.from(staticResourceXml),
  );
  // package.xml
  const types = [
    {
      name: "ApexPage",
      members: [vfPageName],
    },
    {
      name: "StaticResource",
      members: [staticResourceName],
    },
  ];
  const packageXml = buildPackageXml(types, packageName, conn.version);
  pkgZip.addFile("package.xml", Buffer.from(packageXml));
  conn.metadata.pollInterval = 10000;
  conn.metadata.pollTimeout = 300000;
  const ret = await conn.metadata
    .deploy(pkgZip.toBuffer(), {
      singlePackage: true,
      rollbackOnError: true,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .complete({ details: true } as any);
  console.log("deployed", ret);
  return ret;
}
