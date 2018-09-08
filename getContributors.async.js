const rp = require("request-promise");

const getRequestOptions = url => {
    const gitHubAPIBaseUrl = "https://api.github.com";
    const options = {
        uri: gitHubAPIBaseUrl + url,
        headers: {
            "User-Agent": "Get-Organization-Contributors"
        }
    };
    return options;
};

const getFirstThreeOrganizationRepos = async gitHubOrgName => {
    const requestUrl = `/orgs/${gitHubOrgName}/repos?type=public`;
    const allRepos = await rp(getRequestOptions(requestUrl));
    return JSON.parse(allRepos).slice(0, 3);
};

const getRepositoryContributors = async (repoName, repoContributorsUrl) => {
    const result = {};
    result[repoName] = [];
    const contributors = await rp(getRequestOptions(repoContributorsUrl));
    JSON.parse(contributors).forEach(contributor => {
        result[repoName].push(contributor.login);
    });
    return result;
};

const getContributors = async gitHubOrgName => {
    try {
        const repos = await getFirstThreeOrganizationRepos(gitHubOrgName);
        const promises = repos.map(repo => {
            return getRepositoryContributors(
                repo.name,
                `/repos/${repo.owner.login}/${repo.name}/contributors`
            );
        });
        return Promise.all(promises);
    } catch (e) {
        return e;
    }
};

module.exports = getContributors;
