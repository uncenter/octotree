import { FormError, json } from "solid-start";

export type TreeConfig = {
    addIndentChar?: boolean;
    addTrailingSlash?: boolean;
    useFancyCorners?: boolean;
    useRootDir?: boolean;
};

export function flattenPaths(
    hierarchicalList: any,
    parentPath: string = ""
): string[] {
    let flattenedPaths: string[] = [];

    for (const item of hierarchicalList) {
        if (typeof item === "object") {
            const folderName = Object.keys(item)[0];
            const folderPath = parentPath
                ? `${parentPath}/${folderName}`
                : folderName;
            const folderItems = item[folderName];
            const folderPaths = flattenPaths(folderItems, folderPath);
            flattenedPaths = flattenedPaths.concat(folderPaths);
        } else {
            const filePath = parentPath ? `${parentPath}/${item}` : item;
            flattenedPaths.push(filePath);
        }
    }

    return flattenedPaths;
}

function githubRepoToTreeArray(json: string) {
    const hierarchicalList: any = [];

    const data = JSON.parse(json);
    for (const obj of data) {
        const pathArr = obj.path.split("/");
        const fileName = pathArr[pathArr.length - 1];

        let currentList = hierarchicalList;
        for (let i = 0; i < pathArr.length - 1; i++) {
            const folderName = pathArr[i];
            let folderObj = currentList.find(
                (item: any) => typeof item === "object" && item[folderName]
            );
            if (!folderObj) {
                folderObj = { [folderName]: [] };
                currentList.push(folderObj);
            }
            currentList = folderObj[folderName];
        }

        if (obj.type === "tree") {
            const folderName = fileName;
            let folderObj = currentList.find(
                (item: any) => typeof item === "object" && item[folderName]
            );
            if (!folderObj) {
                folderObj = { [folderName]: [] };
                currentList.push(folderObj);
            }
            currentList = folderObj[folderName];
        } else {
            currentList.push(fileName);
        }
    }

    return hierarchicalList;
}

export function buildTree(treeArr: any[], config: TreeConfig) {
    const FILE_PREFIX = "├── ";
    const LAST_FILE_PREFIX = "└── ";
    const FOLDER_SUFFIX = "/";
    const INDENT_PREFIX = config.addIndentChar ? "│   " : "    ";
    const ROOT_PREFIX = "";
    const ROOT_DIR_NAME = ".";

    function asciiTree(arr: any[], level: number = 0) {
        let result = "";
        function getPrefix(level: number, isLast: boolean) {
            if (level === 0) {
                return ROOT_PREFIX;
            }
            if (isLast && config.useFancyCorners) {
                return INDENT_PREFIX.repeat(level - 1) + LAST_FILE_PREFIX;
            }
            return INDENT_PREFIX.repeat(level - 1) + FILE_PREFIX;
        }

        for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            const isLast =
                i === arr.length - 1 ||
                (typeof item === "object" && arr.length > 1);

            if (typeof item === "object") {
                const folderName = Object.keys(item)[0];
                const folderItems = item[folderName];

                result += `${getPrefix(level, isLast)}${folderName}${
                    config.addTrailingSlash === true ? FOLDER_SUFFIX : ""
                }\n`;
                result += asciiTree(folderItems, level + 1);
            } else {
                result += `${getPrefix(level, isLast)}${item}\n`;
            }
        }

        return result;
    }

    if (config.useRootDir === true) {
        treeArr = [{ [ROOT_DIR_NAME]: treeArr }];
    }

    return asciiTree(treeArr);
}
async function getTreeSha(owner: string, repo: string, branch: string) {
    const data = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/branches/${branch}`
    )
        .catch((err) => {
            console.error(err);
            return err;
        })
        .then((res) => res?.json());
    return data.commit.sha;
}

async function getTree(owner: string, repo: string, sha: string) {
    const data = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`
    )
        .catch((err) => {
            console.error(err);
            return err;
        })
        .then((res) => res.json());
    return data.tree;
}

export async function fetchTree(url: string) {
    function parseUrl(url: string) {
        let match = url.match(
            /^(?:https?:\/\/)?github\.com\/([^/]+)\/([^/]+)(?:\/tree\/([^/]+))?$/
        );
        if (match) {
            return [match[1], match[2], match[3]];
        }
        match = url.match(/^([^/]+)\/([^/#]+)(?:#(.+))?$/);
        if (match) {
            return [match[1], match[2], match[3]];
        }
        return [];
    }
    if (url === "") throw new FormError("Please enter a path or URL.");
    let [owner, repo, branch] = parseUrl(url);
    if (!owner || !repo)
        throw new FormError(
            `Invalid path or URL "${url}". Please enter a valid path or URL.`
        );
    let sha;
    console.log("Fetching tree...");
    if (branch === undefined) {
        try {
            sha = await getTreeSha(owner as string, repo as string, "main");
        } catch (err) {
            try {
                sha = await getTreeSha(
                    owner as string,
                    repo as string,
                    "master"
                );
            } catch (err) {
                throw new FormError(
                    `Repository "${owner}/${repo}" not found. Please enter a valid path or URL.`
                );
            }
        }
    } else {
        try {
            sha = await getTreeSha(
                owner as string,
                repo as string,
                branch as string
            );
        } catch (err) {
            throw new FormError("Branch not found.");
        }
    }
    const tree = await getTree(owner as string, repo as string, sha as string);
    return githubRepoToTreeArray(JSON.stringify(tree));
}
