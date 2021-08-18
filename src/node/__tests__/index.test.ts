import { Connection } from "jsforce";
import { createPackage } from "..";

describe("createPackage", () => {
  test("createPackage", async () => {
    const conn = new Connection({ loginUrl: process.env.SF_LOGIN_URL });
    if (process.env.SF_USERNAME && process.env.SF_PASSWORD) {
      await conn.login(process.env.SF_USERNAME, process.env.SF_PASSWORD);
    }
    conn.metadata.pollInterval = 10000;
    conn.metadata.pollTimeout = 300000;
    const ret = await createPackage(conn, {
      inputs: [
        {
          object: "Account",
          csvData: `
Id,Name
001f4000009wJD7AAM,Account 01
`.trim(),
        },
        {
          object: "Contact",
          csvData: `
Id,FirstName,LastName,Email,AccountId
003f4000003d6AhAAI,Jone,01,user01@example.com,001f4000009wJD7AAM
003f4000003d6AiAAI,Jane,02,user02@example.com,001f4000009wJD7AAM
`.trim(),
        },
      ],
    });
    expect(ret).not.toBeNull();
    expect(ret.success).toBeTruthy();
  });
});
