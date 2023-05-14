import { FormError, json } from "solid-start";

export type TreeConfig = {
    addIndentChar?: boolean;
    addTrailingSlash?: boolean;
    useFancyCorners?: boolean;
    useRootDir?: boolean;
};

function githubRepoToTreeObject(json: string) {
    const hierarchicalObj: any = {};

    const data = JSON.parse(json);
    for (const obj of data) {
        const pathArr = obj.path.split("/");
        let currentObj = hierarchicalObj;
        for (const dir of pathArr.slice(0, -1)) {
            if (!currentObj[dir]) {
                currentObj[dir] = {};
            }
            currentObj = currentObj[dir];
        }
        if (obj.type === "tree") {
            currentObj[pathArr[pathArr.length - 1]] = {};
        } else {
            currentObj[pathArr[pathArr.length - 1]] = obj.path.split("/").pop();
        }
    }
    return hierarchicalObj;
}

export function treeObjectToPathsList(obj: Object) {
    const pathsList: string[] = [];
    function traverseTree(obj: any, path: string = "") {
        for (const key in obj) {
            if (obj[key] instanceof Object) {
                traverseTree(obj[key], path + key + "/");
            } else {
                pathsList.push(path + obj[key]);
            }
        }
    }
    traverseTree(obj);
    return pathsList;
}

export function buildTree(treeObj: Object, config: TreeConfig) {
    const FILE_PREFIX = "├── ";
    const LAST_FILE_PREFIX = "└── ";
    const FOLDER_SUFFIX = "/";
    const INDENT_PREFIX = config.addIndentChar ? "│   " : "    ";
    const ROOT_PREFIX = "";

    function asciiTree(obj: any, level: number = 0) {
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

        for (const key in obj) {
            let isLast;
            if (
                obj[key] === Object.keys(obj).pop() ||
                (!config.addIndentChar &&
                    Object.keys(obj[key]).length > 0 &&
                    obj[key] instanceof Object)
            ) {
                isLast = true;
            } else {
                isLast = false;
            }
            if (obj[key] instanceof Object) {
                result += `${getPrefix(level, isLast)}${key}${
                    config.addTrailingSlash === true ? FOLDER_SUFFIX : ""
                }\n`;
                result += asciiTree(obj[key], level + 1);
            } else {
                result += `${getPrefix(level, isLast)}${obj[key]}\n`;
            }
        }

        return result;
    }
    if (config.useRootDir === true) {
        treeObj = { ".": treeObj };
    }
    return asciiTree(treeObj);
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
    return githubRepoToTreeObject(JSON.stringify(tree));
}
