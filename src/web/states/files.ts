import { atom, selector } from "recoil";
import csvParse from "csv-parse";
import { delay } from "../../util";

export const fileUrlsState = atom<string[]>({
  key: "fileUrls",
  default: [],
});

type CSVFileData = {
  url: string;
  filename: string;
  data?: string | null;
  headers?: string[] | null;
  rows?: string[][] | null;
};

export const filesState = selector<CSVFileData[]>({
  key: "files",
  async get({ get }) {
    const fileUrls = get(fileUrlsState);
    return Promise.all(
      fileUrls.map(async (url) => {
        const filename = url.split("/").pop() ?? "";
        try {
          const res = await fetch(url);
          if (!res.ok) {
            return { url, filename };
          }
          const data = await res.text();
          const [headers, ...rows] = await new Promise<string[][]>(
            (resolve, reject) =>
              csvParse(data, {}, (err, records) =>
                err ? reject(err) : resolve(records),
              ),
          );
          return { url, filename, data, headers, rows };
        } catch (e) {
          return { url, filename };
        }
      }),
    );
  },
});
