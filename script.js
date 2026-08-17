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
          /^B[1-4]_\d+_.+\.html$/i.test(file.name)
        )
        .map(file => {

          const match =
            file.name.match(/^B([1-4])_(\d+)_/);

          return {
            block: parseInt(match[1], 10),
            number: parseInt(match[2], 10),
            filename: file.name
          };

        })
        .filter(Boolean);


      /*
       * Recorrem els quatre blocs.
       */

      presentations.forEach(presentation => {

        const blockNumber =
          String(presentation.block).padStart(2, "0");

        const topicNumber =
          String(presentation.number).padStart(2, "0");


        /*
         * Busquem el bloc corresponent.
         */

        const block =
          document.querySelector(
            `#bloc-${blockNumber}`
          );


        if (!block) {
          return;
        }


        /*
         * Busquem el tema dins d'aquest bloc.
         */

        const numberElements =
          block.querySelectorAll(
            ".topic .num"
          );


        numberElements.forEach(numberElement => {

          if (
            numberElement.textContent.trim() !==
            topicNumber
          ) {
            return;
          }


          const topic =
            numberElement.closest(".topic");


          if (!topic) {
            return;
          }


          /*
           * Si ja està disponible,
           * no el tornem a modificar.
           */

          if (
            topic.classList.contains(
              "available"
            )
          ) {
            return;
          }


          /*
           * Convertim "PROPERAMENT"
           * en "DISPONIBLE".
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
           * Movem tot el contingut
           * dins de l'enllaç.
           */

          while (topic.firstChild) {
            link.appendChild(
              topic.firstChild
            );
          }


          /*
           * Actualitzem l'estat.
           */

          const status =
            link.querySelector("em");

          if (status) {
            status.textContent =
              "DISPONIBLE";
          }


          /*
           * Actualitzem el text petit.
           */

          const subtitle =
            link.querySelector("small");

          if (subtitle) {
            subtitle.textContent =
              "Presentació disponible";
          }


          /*
           * Actualitzem la fletxa.

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


      updateCounters();


    } catch (error) {

      console.warn(
        "Error detectant les presentacions:",
        error
      );

    }

  }


  /*
   * ==========================================================
   * ACTUALITZAR COMPTADORS
   * ==========================================================
   */

  function updateCounters() {

    /*
     * Comptador de cada bloc.
     */

    for (
      let blockNumber = 1;
      blockNumber <= 4;
      blockNumber++
    ) {

      const block =
        document.querySelector(
          `#bloc-${String(blockNumber).padStart(2, "0")}`
        );


      if (!block) {
        continue;
      }


      const available =
        block.querySelectorAll(
          ".topic.available"
        ).length;


      const total =
        block.querySelectorAll(
          ".topic"
        ).length;


      const description =
        block.querySelector(
          ".body > p"
        );


      if (description) {
        description.textContent =
          `${available} de ${total} temes disponibles.`;
      }

    }


    /*
     * Comptador general de la portada.
     */

    const hero =
      document.querySelector(
        ".hero aside"
      );


    if (hero) {

      const available =
        document.querySelectorAll(
          ".topic.available"
        ).length;


      const numbers =
        hero.querySelectorAll("b");


      if (numbers.length >= 3) {
        numbers[2].textContent =
          available;
      }

    }

  }


  /*
   * ==========================================================
   * NAVEGACIÓ SUAU
   * ==========================================================
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
   * ==========================================================
   * INICIAR DETECCIÓ AUTOMÀTICA
   * ==========================================================
   */

  detectPresentations();

});
