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

init();
