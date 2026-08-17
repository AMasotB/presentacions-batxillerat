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
        throw new Error(`GitHub error ${response.status}`);
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
        .filter(Boolean);


      /*
       * IMPORTANT:
       * Només busquem presentacions dins del BLOC 1.
       * Això evita activar per error els temes
       * dels Blocs 2, 3 i 4.
       */

      const block1 =
        document.querySelector("#bloc-01");

      if (!block1) {
        return;
      }


      presentations.forEach(presentation => {

        const number =
          String(presentation.number).padStart(2, "0");


        const numberElements =
          block1.querySelectorAll(".topic .num");


        numberElements.forEach(numberElement => {

          if (numberElement.textContent.trim() !== number) {
            return;
          }


          const topic =
            numberElement.closest(".topic");


          if (!topic) {
            return;
          }


          /*
           * Si ja està disponible,
           * no el modifiquem.
           */

          if (topic.classList.contains("available")) {
            return;
          }


          /*
           * Convertim el tema de "PROPERAMENT"
           * a "DISPONIBLE".
           */

          topic.classList.remove("soon");
          topic.classList.add("available");


          /*
           * Creem l'enllaç.
           */

          const link =
            document.createElement("a");

          link.className =
            topic.className;

          link.href =
            presentation.filename;


          /*
           * Movem tot el contingut del tema
           * dins de l'enllaç.
           */

          while (topic.firstChild) {
            link.appendChild(topic.firstChild);
          }


          /*
           * Canviem l'estat.
           */

          const status =
            link.querySelector("em");

          if (status) {
            status.textContent =
              "DISPONIBLE";
          }


          /*
           * Canviem el text petit.
           */

          const subtitle =
            link.querySelector("small");

          if (subtitle) {
            subtitle.textContent =
              "Presentació disponible";
          }


          /*
           * Canviem la fletxa.
           */

          const arrow =
            link.querySelector("b");

          if (arrow) {
            arrow.textContent =
              "↗";
          }


          /*
           * Substituïm el tema original
           * pel nou enllaç.
           */

          topic.parentNode.replaceChild(
            link,
            topic
          );

        });

      });


      updateCounters(block1);

    } catch (error) {

      console.warn(
        "Error detectant les presentacions:",
        error
      );

    }

  }


  function updateCounters(block1) {

    const available =
      block1.querySelectorAll(
        ".topic.available"
      ).length;


    const total =
      block1.querySelectorAll(
        ".topic"
      ).length;


    /*
     * Actualitzem només el text del Bloc 1.
     */

    const description =
      block1.querySelector(
        ".body > p"
      );


    if (description) {
      description.textContent =
        `${available} de ${total} temes disponibles.`;
    }


    /*
     * Actualitzem el número de temes disponibles
     * de la capçalera principal.
     */

    const hero =
      document.querySelector(
        ".hero aside"
      );


    if (hero) {

      const numbers =
        hero.querySelectorAll("b");


      if (numbers.length >= 3) {
        numbers[2].textContent =
          available;
      }

    }

  }


  /*
   * Navegació suau pels enllaços interns.
   */

  const navigationLinks =
    document.querySelectorAll(
      'a[href^="#"]'
    );


  navigationLinks.forEach(link => {

    link.addEventListener(
      "click",
      event => {

        const targetId =
          link.getAttribute("href");


        if (
          !targetId ||
          targetId === "#"
        ) {
          return;
        }


        const target =
          document.querySelector(
            targetId
          );


        if (!target) {
          return;
        }


        event.preventDefault();


        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }
    );

  });


  /*
   * Iniciem la detecció automàtica.
   */

  detectPresentations();

});
