document.addEventListener('DOMContentLoaded', function () {
    const githubUsername = 'Rebullar54346';
    const projectsSection = document.querySelector('#projects .projects');

    // Load repos
    fetch(`https://api.github.com/users/${githubUsername}/repos`)
        .then(response => response.json())
        .then(repos => {
            projectsSection.innerHTML = '';
            repos.forEach(repo => {
                const projectDiv = document.createElement('div');
                projectDiv.className = 'project';
                projectDiv.innerHTML = `
                    <h3>${repo.name}</h3>
                    <p>${repo.description || 'No description provided.'}</p>
                    <button data-repo="${repo.name}">Browse Files</button>
                    <div class="repo-files"></div>
                `;
                projectsSection.appendChild(projectDiv);

                const button = projectDiv.querySelector('button');
                const filesDiv = projectDiv.querySelector('.repo-files');

                button.addEventListener('click', () => {
                    loadContents(repo.name, '', filesDiv);
                });
            });
        })
        .catch(error => {
            projectsSection.innerHTML = '<p>Unable to load GitHub projects.</p>';
            console.error(error);
        });

    // Function to load repo contents
    function loadContents(repoName, path, container) {
        fetch(`https://api.github.com/repos/${githubUsername}/${repoName}/contents/${path}`)
            .then(res => res.json())
            .then(contents => {
                container.innerHTML = '';

                contents.forEach(item => {
                    const itemEl = document.createElement('div');
                    itemEl.style.marginLeft = '20px';

                    if (item.type === 'dir') {
                        itemEl.innerHTML = `📂 <span class="folder" style="cursor:pointer; color:blue;">${item.name}</span>`;
                        container.appendChild(itemEl);

                        itemEl.querySelector('.folder').addEventListener('click', () => {
                            const subContainer = document.createElement('div');
                            itemEl.appendChild(subContainer);
                            loadContents(repoName, item.path, subContainer);
                        });

                    } else if (item.type === 'file') {
                        if (item.name.endsWith('.html')) {
                            // Special case for HTML files: run them
                            itemEl.innerHTML = `⚡ <span class="html-file" style="cursor:pointer; color:green;">${item.name}</span>`;
                            container.appendChild(itemEl);

                            itemEl.querySelector('.html-file').addEventListener('click', () => {
                                const rawUrl = `https://raw.githubusercontent.com/${githubUsername}/${repoName}/main/${item.path}`;
                                // Open raw HTML in a new window
                                fetch(rawUrl)
                                    .then(r => r.text())
                                    .then(html => {
                                        const newWin = window.open();
                                        newWin.document.open();
                                        newWin.document.write(html);
                                        newWin.document.close();
                                    })
                                    .catch(err => console.error('Error loading HTML file:', err));
                            });

                        } else {
                            // Normal files (open on GitHub)
                            itemEl.innerHTML = `📄 <a href="${item.html_url}" target="_blank">${item.name}</a>`;
                            container.appendChild(itemEl);
                        }
                    }
                });
            })
            .catch(err => {
                container.innerHTML = '<p>Error loading contents.</p>';
                console.error(err);
            });
    }
});