const REPO_API = "https://api.github.com/repos/AMasotB/presentacions-batxillerat/contents";

function topicNames() {
    return [...document.querySelectorAll(".topic[data-topic]")].map(el => ({
        id: el.dataset.topic,
        num: el.querySelector(".num")?.textContent.trim() || "",
        name: el.querySelector("strong")?.textContent.trim() || ""
    }));
}

async function listFolder(path) {
    const response = await fetch(`${REPO_API}/${path}`);

    if (!response.ok) {
        return [];
    }

    const items = await response.json();

    if (!Array.isArray(items)) {
        return [];
    }

    return items
        .filter(item =>
            item.type === "file" &&
            /\.pdf$/i.test(item.name)
        )
        .sort((a, b) =>
            a.name.localeCompare(
                b.name,
                undefined,
                { numeric: true }
            )
        );
}

async function renderPdfBrowser(containerId, kind) {

    const container = document.getElementById(containerId);

    if (!container) {
        return;
    }

    const topics = topicNames();

    container.innerHTML = "";

    for (const topic of topics) {

        const topicNumber =
            topic.id.match(/tema-(\d+)$/)?.[1];

        if (!topicNumber) {
            continue;
        }

        const folder =
            `${kind}/tema-${topicNumber.padStart(2, "0")}`;

        const files =
            await listFolder(folder);

        const details =
            document.createElement("details");

        const summary =
            document.createElement("summary");

        summary.textContent =
            `Tema ${topic.num} · ${topic.name}`;

        details.appendChild(summary);

        if (files.length) {

            files.forEach(file => {

                const link =
                    document.createElement("a");

                link.href =
                    file.download_url || file.html_url;

                link.target = "_blank";

                link.rel = "noopener";

                link.textContent =
                    `📄 ${file.name}`;

                details.appendChild(link);

            });

        } else {

            const empty =
                document.createElement("p");

            empty.className = "empty";

            empty.textContent =
                "Encara no hi ha PDFs disponibles.";

            details.appendChild(empty);
        }

        container.appendChild(details);
    }

    if (!topics.length) {

        container.innerHTML =
            "<p class='empty'>No s'han trobat temes.</p>";

    }
}

renderPdfBrowser(
    "activitats-pdf",
    "activitats"
);

renderPdfBrowser(
    "pau-pdf",
    "pau"
);
