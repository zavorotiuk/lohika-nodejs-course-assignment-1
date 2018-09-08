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

const getFirstThreeOrganizationRepos = gitHubOrgName => {
    const requestUrl = `/orgs/${gitHubOrgName}/repos?type=public`;

    return new Promise((resolve, reject) => {
        rp(getRequestOptions(requestUrl))
            .then(allRepos => {
                resolve(JSON.parse(allRepos).slice(0, 3));
            })
            .catch(err => {
                reject(err);
            });
    });
};

const getRepositoryContributors = (repoName, repoContributorsUrl) => {
    const result = {};
    result[repoName] = [];
    return rp(getRequestOptions(repoContributorsUrl)).then(contributors => {
        JSON.parse(contributors).forEach(contributor => {
            result[repoName].push(contributor.login);
        });
        return result;
    });
};

const getContributors = gitHubOrgName => {
    return new Promise((resolve, reject) => {
        getFirstThreeOrganizationRepos(gitHubOrgName)
            .then(repos => {
                const promises = repos.map(repo => {
                    return getRepositoryContributors(
                        repo.name,
                        `/repos/${repo.owner.login}/${repo.name}/contributors`
                    );
                });
                resolve(Promise.all(promises));
            })
            .catch(err => {
                reject(err);
            });
    });
};

module.exports = getContributors;
