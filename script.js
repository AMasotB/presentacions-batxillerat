const MANIFEST_URL = "manifest.json";

function topicElements() {
    // Cada .topic (disponible o "soon") ha de portar data-topic="B{bloc}_{NN}"
    return [...document.querySelectorAll(".topic[data-topic]")];
}

async function loadManifest() {
    try {
        const response = await fetch(MANIFEST_URL, { cache: "no-store" });
        if (!response.ok) return null;
        return await response.json();
    } catch (err) {
        console.error("No s'ha pogut carregar manifest.json", err);
        return null;
    }
}

function renderPdfBrowser(containerId, kind, manifest) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const topics = topicElements();
    const files = manifest?.[kind] || {};

    container.innerHTML = "";

    if (!topics.length) {
        container.innerHTML = "<p class='empty'>No s'han trobat temes.</p>";
        return;
    }

    for (const topicEl of topics) {
        const topicId = topicEl.dataset.topic;
        const label = topicEl.querySelector("strong")?.textContent.trim() || topicId;
        const topicFiles = files[topicId] || [];

        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.textContent = label;
        details.appendChild(summary);

        if (topicFiles.length) {
            topicFiles.forEach(name => {
                const link = document.createElement("a");
                link.href = `${kind}/${topicId}/${encodeURIComponent(name)}`;
                link.target = "_blank";
                link.rel = "noopener";
                link.textContent = `📄 ${name}`;
                details.appendChild(link);
            });
        } else {
            const empty = document.createElement("p");
            empty.className = "empty";
            empty.textContent = "Encara no hi ha documents disponibles.";
            details.appendChild(empty);
        }

        container.appendChild(details);
    }
}

async function init() {
    const manifest = await loadManifest();
    renderPdfBrowser("activitats-pdf", "activitats", manifest);
    renderPdfBrowser("pau-pdf", "pau", manifest);
}

init();const REPO_API = "https://api.github.com/repos/AMasotB/presentacions-batxillerat/contents";

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

// DESACTIVAT TEMPORALMENT: aquesta funció mai trobava res perquè cap
// element .topic tenia l'atribut data-topic, i a més fa fins a 118
// crides sense autenticar a l'API de GitHub (59 temes x 2 carpetes),
// que supera el límit de 60 peticions/hora en un sol carregament de
// pàgina. Cal redissenyar-ho (per exemple generant un índex JSON
// estàtic en build en lloc de consultar l'API en cada visita) abans
// de tornar a activar-ho.
function showPdfBrowserPlaceholder(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = "<p class='empty'>Aviat disponible.</p>";
    }
}

showPdfBrowserPlaceholder("activitats-pdf");
showPdfBrowserPlaceholder("pau-pdf");const REPO_API = "https://api.github.com/repos/AMasotB/presentacions-batxillerat/contents";

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
