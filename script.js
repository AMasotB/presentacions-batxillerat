document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'})}}));(async function autoDetectPresentations() {
  const owner = "neterider";
  const repo = "presentacions-batxillerat";
  const branch = "main";

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/?ref=${branch}`
    );

    if (!response.ok) {
      throw new Error("No s'ha pogut consultar GitHub.");
    }

    const files = await response.json();

    // Només HTML que comencin per un número de tema.
    const presentations = files
      .filter(file =>
        file.type === "file" &&
        /^\\d+_.+\\.html$/i.test(file.name)
      )
      .map(file => {
        const match = file.name.match(/^(\\d+)_/);

        return {
          number: parseInt(match[1], 10),
          filename: file.name,
          title: file.name
            .replace(/^\\d+_/, "")
            .replace(/\\.html$/i, "")
            .replace(/_Presentacio\\(?1?\\)?$/i, "")
            .replace(/_/g, " ")
        };
      })
      .sort((a, b) => a.number - b.number);

    if (!presentations.length) return;

    // Busquem el primer bloc de temes.
    const block = document.querySelector("#bloc-01 .topics");

    if (!block) return;

    // Eliminem la llista actual i la reconstruïm.
    block.innerHTML = "";

    presentations.forEach(item => {
      const link = document.createElement("a");

      link.className = "topic available";
      link.href = item.filename;

      link.innerHTML = `
        <span class="num">${String(item.number).padStart(2, "0")}</span>
        <span>
          <strong>${item.title}</strong>
          <small>Presentació disponible</small>
        </span>
        <em>DISPONIBLE</em>
        <b>↗</b>
      `;

      block.appendChild(link);
    });

    // Actualitzem els comptadors visibles del bloc.
    const blockDescription = document.querySelector("#bloc-01 .body > p");

    if (blockDescription) {
      blockDescription.textContent =
        `${presentations.length} de 10 temes disponibles.`;
    }

    // Actualitzem el número de disponibles de la portada.
    const heroAside = document.querySelector(".hero aside");

    if (heroAside) {
      const bolds = heroAside.querySelectorAll("b");

      if (bolds.length >= 3) {
        bolds[2].textContent = presentations.length;
      }
    }

  } catch (error) {
    console.warn("No s'han pogut detectar les presentacions:", error);
  }
})();
