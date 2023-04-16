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
                result += `${getPrefix(level, isLast)}${key}${FOLDER_SUFFIX}\n`;
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
        return "Invalid URL";
    }
    if (url === "") {
        return "Please enter a path or URL.";
    }

    const [owner, repo, branch] = parseUrl(url);
    if (!isServer) {
        if (localStorage.getItem(`${owner}/${repo}#${branch}`)) {
            return localStorage.getItem(`${owner}/${repo}#${branch}`);
        }
    }
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
            } catch (err: any) {
                return "Repository not found or does not have 'main' or 'master' branch. Please specify a branch.";
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
            `${owner}/${repo}#${branch}`,
            buildAsciiTree(createTreeObject(JSON.stringify(tree)), config)
        );
    }
    return buildAsciiTree(createTreeObject(JSON.stringify(tree)), config);
}
