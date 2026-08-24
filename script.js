const MANIFEST_URL = "manifest.json";

const BLOCS = [
    { id: "bloc-01", label: "Bloc 01 · Catalunya i Espanya al món" },
    { id: "bloc-02", label: "Bloc 02 · Medi Ambient" },
    { id: "bloc-03", label: "Bloc 03 · Territori i activitats econòmiques" },
    { id: "bloc-04", label: "Bloc 04 · Demografia i ciutats" },
];

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

    const files = manifest?.[kind] || {};

    container.innerHTML = "";

    for (const bloc of BLOCS) {
        const blocFiles = files[bloc.id] || [];

        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.textContent = bloc.label;
        details.appendChild(summary);

        if (blocFiles.length) {
            blocFiles.forEach(name => {
                const link = document.createElement("a");
                link.href = `${kind}/${bloc.id}/${encodeURIComponent(name)}`;
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

init();
