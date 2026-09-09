import AdmZip from "adm-zip";
import { buildPackageZip } from "..";

describe("buildPackageZip", () => {
  test("buildPackageZip", async () => {
    const inputs = [
      {
        object: "Account",
        csvData: `
Id,Name
001f4000009wJD7AAM,Account 01
`.trim(),
      },
    ];
    const { packagePrefix, zip } = await buildPackageZip({
      inputs,
      apiVersion: "52.0",
      packagePrefix: "DataMigrationPack_test0001",
    });
    expect(packagePrefix).toBe("DataMigrationPack_test0001");
    const pkgZip = new AdmZip(zip);
    const entries = pkgZip.getEntries().map((e) => e.entryName);
    expect(entries.sort()).toEqual(
      [
        "package.xml",
        "pages/DataMigrationPack_test0001_CommanderPage.page",
        "pages/DataMigrationPack_test0001_CommanderPage.page-meta.xml",
        "staticresources/DataMigrationPack_test0001_Files.resource",
        "staticresources/DataMigrationPack_test0001_Files.resource-meta.xml",
        "tabs/DataMigrationPack_test0001_CommanderTab.tab-meta.xml",
      ].sort(),
    );
    const packageXml = pkgZip.readAsText("package.xml");
    expect(packageXml).toContain("<version>52.0</version>");
    expect(packageXml).not.toContain("<fullName>");
    const files = new AdmZip(
      pkgZip.readFile(
        "staticresources/DataMigrationPack_test0001_Files.resource",
      ) as Buffer,
    )
      .getEntries()
      .map((e) => e.entryName);
    expect(files.sort()).toEqual(
      ["data/Account.csv", "scripts/migration-app-pack.js"].sort(),
    );
  });

  test("buildPackageZip without packagePrefix", async () => {
    const { packagePrefix } = await buildPackageZip({
      inputs: [],
      apiVersion: "52.0",
    });
    expect(packagePrefix).toMatch(/^DataMigrationPack_[0-9a-z]{8}$/);
  });
});
