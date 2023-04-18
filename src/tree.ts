import { isServer } from "solid-js/web";

function createTreeObject(json: string) {
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

function sortTreeByFileType(treeObj: any) {
    console.log(treeObj);
    const sortedTreeObj: any = {};
    const folders: any = [];
    const files: any = [];
    for (const key in treeObj) {
        if (treeObj[key] instanceof Object) {
            folders.push(key);
        } else {
            files.push(key);
        }
    }
    folders.sort();
    files.sort();
    for (const folder of folders) {
        sortedTreeObj[folder] = treeObj[folder];
    }
    for (const file of files) {
        sortedTreeObj[file] = treeObj[file];
    }
    return sortedTreeObj;
}

function buildAsciiTree(treeObj: Object, config: any = {}) {
    const FILE_PREFIX = "├── ";
    const LAST_FILE_PREFIX = "└── ";
    const FOLDER_SUFFIX = "/";
    const INDENT_PREFIX = "│   ";
    const ROOT_PREFIX = "";

    function asciiTree(obj: any, level: number, config: any) {
        let result = "";
        function getPrefix(level: number, isLast: boolean) {
            if (level === 0) {
                return ROOT_PREFIX;
            }
            if (isLast && config.roundLast === true) {
                return INDENT_PREFIX.repeat(level - 1) + LAST_FILE_PREFIX;
            }
            return INDENT_PREFIX.repeat(level - 1) + FILE_PREFIX;
        }

        for (const key in obj) {
            let isLast;
            if (obj[key] === Object.keys(obj).pop()) {
                isLast = true;
            } else {
                isLast = false;
            }
            if (obj[key] instanceof Object) {
                result += `${getPrefix(level, isLast)}${key}${
                    config.trailingSlash === true ? FOLDER_SUFFIX : ""
                }\n`;
                result += asciiTree(obj[key], level + 1, config);
            } else {
                result += `${getPrefix(level, isLast)}${obj[key]}\n`;
            }
        }

        return result;
    }
    if (config.rootDir === true) {
        treeObj = { ".": treeObj };
    }
    return asciiTree(treeObj, 0, config);
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

export async function urlToTree(url: string, config: any = {}) {
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
    if (url === "") {
        return "Please enter a path or URL.";
    }
    let [owner, repo, branch] = parseUrl(url);
    if (!owner || !repo) {
        return `Invalid path or URL "${url}". Please enter a valid path or URL.`;
    }
    if (!isServer && config.cache === true) {
        if (localStorage.getItem(`cache.${owner}/${repo}#${branch}`)) {
            if (
                new Date(
                    localStorage.getItem(
                        `cache.expires.${owner}/${repo}#${branch}`
                    ) as string
                ) > new Date()
            ) {
                console.log("Using cached tree...");
                return buildAsciiTree(
                    JSON.parse(
                        localStorage.getItem(
                            `cache.${owner}/${repo}#${branch}`
                        ) as string
                    ),
                    config
                );
            } else {
                console.log("Cache expired, fetching tree...");
                localStorage.removeItem(`cache.${owner}/${repo}#${branch}`);
                localStorage.removeItem(
                    `cache.expires.${owner}/${repo}#${branch}`
                );
            }
        }
    }
    let sha;
    console.log("Fetching tree...");
    if (branch === undefined) {
        try {
            sha = await getTreeSha(owner as string, repo as string, "main");
            branch = "main";
        } catch (err) {
            try {
                sha = await getTreeSha(
                    owner as string,
                    repo as string,
                    "master"
                );
                branch = "master";
            } catch (err: any) {
                return `Repository "${owner}/${repo}" not found. Please enter a valid path or URL.`;
            }
        }
    } else {
        try {
            sha = await getTreeSha(
                owner as string,
                repo as string,
                branch as string
            );
        } catch (err: any) {
            return "Branch not found.";
        }
    }
    const tree = await getTree(owner as string, repo as string, sha as string);
    if (!isServer) {
        localStorage.setItem(
            `cache.${owner}/${repo}#${branch}`,
            JSON.stringify(createTreeObject(JSON.stringify(tree)))
        );
        localStorage.setItem(
            `cache.expires.${owner}/${repo}#${branch}`,
            new Date(Date.now() + 1000 * 60 * 60).toString()
        );
    }
    return buildAsciiTree(createTreeObject(JSON.stringify(tree)), config);
}
