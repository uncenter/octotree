const FILE_PREFIX = "├── ";
const FOLDER_SUFFIX = "/";
const INDENT_PREFIX = "│   ";
const ROOT_PREFIX = "";

function buildAsciiTree(json: string) {
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

    function asciiTree(obj: any, level: number) {
        let result = "";
        let PRE;
        if (level === 0) {
            PRE = ROOT_PREFIX;
        } else {
            PRE = INDENT_PREFIX.repeat(level - 1) + FILE_PREFIX;
        }

        for (const key in obj) {
            if (obj[key] instanceof Object) {
                result += `${PRE}${key}${FOLDER_SUFFIX}\n`;
                result += asciiTree(obj[key], level + 1);
            } else {
                result += `${PRE}${obj[key]}\n`;
            }
        }

        return result;
    }
    return asciiTree(hierarchicalObj, 0);
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

export async function urlToTree(url: string) {
    if (url === "") return "";
    let match = url.match(/^(?:github\.com\/)?([^/]+)\/([^/]+)$/);
    if (!match) return "Invalid URL.";
    const [owner, repo] = match.slice(1);
    let sha;
    try {
        sha = await getTreeSha(owner, repo, "master");
    } catch (err) {
        try {
            sha = await getTreeSha(owner, repo, "main");
        } catch (err: any) {
            console.error(err);
            return "Repository not found.";
        }
    }
    const tree = await getTree(owner, repo, sha);
    return buildAsciiTree(JSON.stringify(tree));
}
