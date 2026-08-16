document.addEventListener("DOMContentLoaded", () => {

  const GITHUB_OWNER = "neterider";
  const GITHUB_REPOSITORY = "presentacions-batxillerat";
  const GITHUB_BRANCH = "main";

  const GITHUB_API_URL =
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPOSITORY}/contents/?ref=${GITHUB_BRANCH}`;

  async function detectPresentations() {
    try {
      const response = await fetch(GITHUB_API_URL, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`GitHub ha retornat l'error ${response.status}`);
      }

      const files = await response.json();

      const presentations = files
        .filter(file =>
          file.type === "file" &&
          /^\d+_.+\.html$/i.test(file.name)
        )
        .map(file => {
          const match = file.name.match(/^(\d+)_/);

          return {
            number: parseInt(match[1], 10),
            filename: file.name
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.number - b.number);

      console.log("Presentacions detectades:", presentations);

      presentations.forEach(presentation => {

        const number = String(presentation.number).padStart(2, "0");

        const topicNumbers = document.querySelectorAll(".topic .num");

        topicNumbers.forEach(numberElement => {

          const topicNumber = numberElement.textContent.trim();

          if (topicNumber !== number) {
            return;
          }

          const topic = numberElement.closest(".topic");

          if (!topic) {
            return;
          }

          if (!topic.classList.contains("soon")) {
            return;
          }

          topic.classList.remove("soon");
          topic.classList.add("available");

          const link = document.createElement("a");

          link.className = topic.className;
          link.href = presentation.filename;

          while (topic.firstChild) {
            link.appendChild(topic.firstChild);
          }

          const status = link.querySelector("em");

          if (status) {
            status.textContent = "DISPONIBLE";
          }

          const arrow = link.querySelector("b");

          if (arrow) {
            arrow.textContent = "↗";
          }

          topic.parentNode.replaceChild(link, topic);

        });

      });

      updateAvailableCount();

      updateHeroCount();

    } catch (error) {
      console.warn(
        "No s'han pogut detectar les presentacions:",
        error
      );
    }
  }

  function updateAvailableCount() {

    const block = document.querySelector("#bloc-01");

    if (!block) {
      return;
    }

    const availableTopics =
      block.querySelectorAll(".topic.available");

    const totalTopics =
      block.querySelectorAll(".topic");

    const description =
      block.querySelector(".body > p");

    if (description) {
      description.textContent =
        `${availableTopics.length} de ${totalTopics.length} temes disponibles.`;
    }
  }

  function updateHeroCount() {

    const hero = document.querySelector(".hero aside");

    if (!hero) {
      return;
    }

    const availableTopics =
      document.querySelectorAll(".topic.available");

    const numbers = hero.querySelectorAll("b");

    if (numbers.length >= 3) {
      numbers[2].textContent =
        availableTopics.length;
    }
  }

  const navigationLinks =
    document.querySelectorAll('a[href^="#"]');

  navigationLinks.forEach(link => {

    link.addEventListener("click", event => {

      const targetId =
        link.getAttribute("href");

      if (!targetId || targetId === "#") {
        return;
      }

      const target =
        document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    });

  });

  detectPresentations();

});
