import fs from "fs-extra";
import path from "path";
import AdmZip from "adm-zip";
import { Connection } from "jsforce";
import {
  RecordMappingPolicy,
  UploadInput,
  UploadOptions,
} from "salesforce-migration-automatic";
import { delay } from "../util";

function randid() {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let id = "";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

async function findExistingPackagePrefix(
  conn: Connection,
  packageName: string,
) {
  type RetrieveResult = {
    id: string;
    success: string | boolean;
    done: string | boolean;
    fileProperties?: Array<{
      fullName: string;
    }>;
  };
  const ret = await conn.metadata.retrieve({
    singlePackage: true,
    packageNames: [packageName],
  });
  const timeoutAt = Date.now() + 300000;
  let result: RetrieveResult;
  do {
    await delay(5000);
    result = (await conn.metadata.checkRetrieveStatus(
      ret.id,
    )) as unknown as RetrieveResult;
  } while (String(result.done) !== "true" && Date.now() < timeoutAt);
  const fileProperties = !result.fileProperties
    ? []
    : Array.isArray(result.fileProperties)
    ? result.fileProperties
    : [result.fileProperties];
  for (const file of fileProperties) {
    const m = file.fullName.match(/^DataMigrationPack_[0-9a-z]+/);
    if (m) {
      return m[0];
    }
  }
  return null;
}

function buildCommanderPage(
  staticResourceName: string,
  inputs: UploadInput[],
  mappings: RecordMappingPolicy[] = [],
  options: UploadOptions = {},
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const inputRefs = inputs.map(({ csvData, ...inputs }, i) => ({
    ...inputs,
    fileIndex: i,
  }));
  return `
<apex:page docType="html-5.0"
	sidebar="false"
	cache="true"
	title="Migration Commander"
>
<apex:slds />
<div>Package created at: ${new Date().toLocaleString()}</div>
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
  inputs: ${JSON.stringify(inputRefs)},
  mappings: ${JSON.stringify(mappings)},
  options: ${JSON.stringify(options)}
};
</script>
<script src="{!URLFOR($Resource.${staticResourceName}, 'scripts/migration-app-pack.js')}"></script> 
</apex:page>
	`.trim();
}

function buildCommanderPageXml(
  visualforcePageName: string,
  apiVersion: string,
) {
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

function buildCommanderTabXml(tabLabel: string, visualforcePageName: string) {
  return `
<?xml version="1.0" encoding="UTF-8"?>
<CustomTab xmlns="http://soap.sforce.com/2006/04/metadata">
  <label>${tabLabel}</label>
  <mobileReady>false</mobileReady>
  <motif>Custom204: TV Widescreen</motif>
  <page>${visualforcePageName}</page>
</CustomTab>
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
    ${members.map((member) => `<members>${member}</members>`).join("\n    ")}
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
  params: {
    inputs: UploadInput[];
    mappings?: RecordMappingPolicy[];
    options?: UploadOptions;
    packageName?: string;
    commanderTabLabel?: string;
  },
) {
  const {
    inputs,
    mappings,
    options,
    packageName: packageName_,
    commanderTabLabel: tabLabel_,
  } = params;
  const packid = randid();
  const packagePrefix =
    (packageName_
      ? await findExistingPackagePrefix(conn, packageName_)
      : null) ?? `DataMigrationPack_${packid}`;
  const packageName = packageName_ || `Data Migration Pack (${packid})`;
  const staticResourceName = `${packagePrefix}_Files`;
  const tabLabel = tabLabel_ || "Migration Commander";
  const tabName = `${packagePrefix}_CommanderTab`;
  const pageLabel = `${tabLabel} Page`;
  const pageName = `${packagePrefix}_CommanderPage`;

  const pkgZip = new AdmZip();
  // Visualforce Page
  const pageContent = buildCommanderPage(
    staticResourceName,
    inputs,
    mappings,
    options,
  );
  pkgZip.addFile(
    path.join("pages", `${pageName}.page`),
    Buffer.from(pageContent),
  );
  const pageXml = buildCommanderPageXml(pageLabel, conn.version);
  pkgZip.addFile(
    path.join("pages", `${pageName}.page-meta.xml`),
    Buffer.from(pageXml),
  );
  // Custom Tab
  const tabXml = buildCommanderTabXml(tabLabel, pageName);
  pkgZip.addFile(
    path.join("tabs", `${tabName}.tab-meta.xml`),
    Buffer.from(tabXml),
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
      members: [pageName],
    },
    {
      name: "StaticResource",
      members: [staticResourceName],
    },
    {
      name: "CustomTab",
      members: [tabName],
    },
  ];
  const packageXml = buildPackageXml(types, packageName, conn.version);
  pkgZip.addFile("package.xml", Buffer.from(packageXml));
  const ret = await conn.metadata.deploy(pkgZip.toBuffer(), {
    singlePackage: true,
    rollbackOnError: true,
  });
  let result;
  const timeoutAt = Date.now() + 300000;
  do {
    result = await conn.metadata.checkDeployStatus(ret.id, true);
    await delay(10000);
  } while (!result.done && Date.now() < timeoutAt);
  if (result.success) {
    const packageInfo = await conn.tooling
      .sobject("MetadataPackage")
      .findOne({ Name: packageName });
    return { ...result, packageInfo };
  }
  return { ...result, packageInfo: null };
}
