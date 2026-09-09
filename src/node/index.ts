import fs from "fs-extra";
import path from "path";
import AdmZip from "adm-zip";
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
</Package>
	`.trim();
}

export type PackageFile = {
  path: string;
  content: Buffer;
};

export type PackageBuildParams = {
  inputs: UploadInput[];
  mappings?: RecordMappingPolicy[];
  options?: UploadOptions;
  apiVersion: string;
  /** prefix of API names of generated components (default: `DataMigrationPack_<random>`) */
  packagePrefix?: string;
  commanderTabLabel?: string;
};

/**
 * Build metadata files (in metadata API format) of the migration app package
 */
export async function buildPackageFiles(params: PackageBuildParams) {
  const {
    inputs,
    mappings,
    options,
    apiVersion,
    packagePrefix: packagePrefix_,
    commanderTabLabel: tabLabel_,
  } = params;
  const packagePrefix = packagePrefix_ ?? `DataMigrationPack_${randid()}`;
  const staticResourceName = `${packagePrefix}_Files`;
  const tabLabel = tabLabel_ || "Migration Commander";
  const tabName = `${packagePrefix}_CommanderTab`;
  const pageLabel = `${tabLabel} Page`;
  const pageName = `${packagePrefix}_CommanderPage`;

  const files: PackageFile[] = [];
  // Visualforce Page
  const pageContent = buildCommanderPage(
    staticResourceName,
    inputs,
    mappings,
    options,
  );
  files.push({
    path: `pages/${pageName}.page`,
    content: Buffer.from(pageContent),
  });
  const pageXml = buildCommanderPageXml(pageLabel, apiVersion);
  files.push({
    path: `pages/${pageName}.page-meta.xml`,
    content: Buffer.from(pageXml),
  });
  // Custom Tab
  const tabXml = buildCommanderTabXml(tabLabel, pageName);
  files.push({
    path: `tabs/${tabName}.tab-meta.xml`,
    content: Buffer.from(tabXml),
  });
  // Static Resource
  const staticResource = await buildStaticResource(inputs);
  files.push({
    path: `staticresources/${staticResourceName}.resource`,
    content: staticResource,
  });
  const staticResourceXml = await buildStaticResourceXml();
  files.push({
    path: `staticresources/${staticResourceName}.resource-meta.xml`,
    content: Buffer.from(staticResourceXml),
  });
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
  const packageXml = buildPackageXml(types, apiVersion);
  files.push({ path: "package.xml", content: Buffer.from(packageXml) });
  return { packagePrefix, files };
}

/**
 * Build zipped metadata package (in metadata API format) of the migration app package
 */
export async function buildPackageZip(params: PackageBuildParams) {
  const { packagePrefix, files } = await buildPackageFiles(params);
  const pkgZip = new AdmZip();
  for (const { path: filePath, content } of files) {
    pkgZip.addFile(filePath, content);
  }
  return { packagePrefix, zip: pkgZip.toBuffer() };
}
