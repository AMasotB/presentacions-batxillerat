document.addEventListener("DOMContentLoaded", () => {

  const GITHUB_OWNER = "neterider";
  const GITHUB_REPOSITORY = "presentacions-batxillerat";
  const GITHUB_BRANCH = "main";

  const GITHUB_API_URL =
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPOSITORY}/contents/?ref=${GITHUB_BRANCH}`;

  async function detectFiles() {

    try {

      const response = await fetch(GITHUB_API_URL, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`GitHub error ${response.status}`);
      }

      const files = await response.json();

      const htmlFiles = files.filter(file =>
        file.type === "file" &&
        /\.html$/i.test(file.name)
      );

      detectPresentations(htmlFiles);
      detectActivities(files);
      updateCounters();

    } catch (error) {

      console.warn(
        "Error detectant els fitxers de GitHub:",
        error
      );

    }

  }


  /* =========================================================
     PRESENTACIONS
     Detecta:
     B1_01_...
     B1_02_...
     B2_01_...
     B3_01_...
     B4_01_...
     ========================================================= */

  function detectPresentations(files) {

    files
      .filter(file =>
        /^B[1-4]_\d+_.+\.html$/i.test(file.name)
      )
      .forEach(file => {

        const match =
          file.name.match(/^B([1-4])_(\d+)_/i);

        if (!match) {
          return;
        }

        const blockNumber =
          parseInt(match[1], 10);

        const topicNumber =
          String(
            parseInt(match[2], 10)
          ).padStart(2, "0");

        const block =
          document.querySelector(
            `#bloc-${String(blockNumber).padStart(2, "0")}`
          );

        if (!block) {
          return;
        }

        const topics =
          block.querySelectorAll(".topic");

        topics.forEach(topic => {

          const number =
            topic.querySelector(".num");

          if (!number) {
            return;
          }

          if (
            number.textContent.trim() !==
            topicNumber
          ) {
            return;
          }

          const filename =
            file.name;

          const current =
            topic.querySelector("a");

          if (current) {

            current.href = filename;
            current.target = "_blank";
            current.rel = "noopener";

            topic.classList.remove("soon");
            topic.classList.add("available");

            const small =
              topic.querySelector("small");

            if (small) {
              small.textContent =
                "Presentació disponible";
            }

            const status =
              topic.querySelector("em");

            if (status) {
              status.textContent =
                "DISPONIBLE";
            }

            const arrow =
              topic.querySelector("b");

            if (arrow) {
              arrow.textContent = "↗";
            }

            return;
          }

          const link =
            document.createElement("a");

          link.className =
            topic.className;

          link.href =
            filename;

          link.target =
            "_blank";

          link.rel =
            "noopener";

          while (topic.firstChild) {
            link.appendChild(
              topic.firstChild
            );
          }

          const small =
            link.querySelector("small");

          if (small) {
            small.textContent =
              "Presentació disponible";
          }

          const status =
            link.querySelector("em");

          if (status) {
            status.textContent =
              "DISPONIBLE";
          }

          const arrow =
            link.querySelector("b");

          if (arrow) {
            arrow.textContent =
              "↗";
          }

          link.classList.remove("soon");
          link.classList.add("available");

          topic.parentNode.replaceChild(
            link,
            topic
          );

        });

      });

  }


  /* =========================================================
     ACTIVITATS
     
     Format:

     ACT_B1_01_01_Nom.pdf
     ACT_B1_01_02_Nom.html
     ACT_B1_02_01_Nom.pdf

     B1 = bloc
     01 = tema
     01 = activitat
     ========================================================= */

  function detectActivities(files) {

    const activities =
      files
        .filter(file =>
          file.type === "file" &&
          /^ACT_B[1-4]_\d+_\d+_.+\.(pdf|html)$/i.test(file.name)
        )
        .map(file => {

          const match =
            file.name.match(
              /^ACT_B([1-4])_(\d+)_(\d+)_(.+)\.(pdf|html)$/i
            );

          if (!match) {
            return null;
          }

          return {
            block: parseInt(match[1], 10),
            topic: parseInt(match[2], 10),
            activity: parseInt(match[3], 10),
            name: match[4]
              .replace(/_/g, " "),
            filename: file.name,
            extension:
              match[5].toLowerCase()
          };

        })
        .filter(Boolean)
        .sort((a, b) => {

          if (a.block !== b.block) {
            return a.block - b.block;
          }

          if (a.topic !== b.topic) {
            return a.topic - b.topic;
          }

          return a.activity - b.activity;

        });


    const activityArticle =
      findActivityArticle();

    if (!activityArticle) {
      return;
    }


    if (activities.length === 0) {

      activityArticle.querySelector("p").textContent =
        "Encara no hi ha activitats disponibles.";

      return;

    }


    const description =
      activityArticle.querySelector("p");

    if (description) {
      description.textContent =
        `${activities.length} activitats disponibles.`;
    }


    let list =
      activityArticle.querySelector(
        ".activities-list"
      );

    if (!list) {

      list =
        document.createElement("div");

      list.className =
        "activities-list";

      activityArticle.appendChild(
        list
      );

    }

    list.innerHTML = "";


    let currentBlock = null;
    let currentTopic = null;


    activities.forEach(activity => {

      if (
        currentBlock !== activity.block
      ) {

        currentBlock =
          activity.block;

        currentTopic =
          null;

        const blockTitle =
          document.createElement("h4");

        blockTitle.textContent =
          `Bloc ${String(activity.block).padStart(2, "0")}`;

        list.appendChild(
          blockTitle
        );

      }


      if (
        currentTopic !== activity.topic
      ) {

        currentTopic =
          activity.topic;

        const topicTitle =
          document.createElement("div");

        topicTitle.className =
          "activity-topic";

        topicTitle.textContent =
          `Tema ${String(activity.topic).padStart(2, "0")}`;

        list.appendChild(
          topicTitle
        );

      }


      const link =
        document.createElement("a");

      link.href =
        activity.filename;

      link.target =
        "_blank";

      link.rel =
        "noopener";

      link.className =
        "activity-link";


      const number =
        document.createElement("strong");

      number.textContent =
        String(activity.activity).padStart(2, "0");


      const text =
        document.createElement("span");

      text.textContent =
        activity.name;


      const type =
        document.createElement("em");

      if (activity.extension === "pdf") {

        type.textContent =
          "VEURE / DESCARREGAR ↗";

      } else {

        type.textContent =
          "OBRIR ACTIVITAT ↗";

      }


      link.appendChild(number);
      link.appendChild(text);
      link.appendChild(type);

      list.appendChild(
        link
      );

    });

  }


  /* =========================================================
     TROBAR L'ARTICLE "ACTIVITATS"
     ========================================================= */

  function findActivityArticle() {

    const articles =
      document.querySelectorAll(
        ".resourcesgrid article"
      );

    for (const article of articles) {

      const title =
        article.querySelector("h3");

      if (!title) {
        continue;
      }

      if (
        title.textContent
          .trim()
          .toLowerCase() ===
        "activitats"
      ) {
        return article;
      }

    }

    return null;

  }


  /* =========================================================
     COMPTADORS DELS BLOCS
     ========================================================= */

  function updateCounters() {

    let totalAvailable = 0;

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

      totalAvailable +=
        available;

      const description =
        block.querySelector(
          ".body > p"
        );

      if (description) {

        description.textContent =
          `${available} de ${total} temes disponibles.`;

      }

    }


    const hero =
      document.querySelector(
        ".hero aside"
      );

    if (hero) {

      const numbers =
        hero.querySelectorAll("b");

      if (numbers.length >= 3) {

        numbers[2].textContent =
          totalAvailable;

      }

    }

  }


  /* =========================================================
     NAVEGACIÓ SUAU
     ========================================================= */

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


  /* =========================================================
     INICI
     ========================================================= */

  detectFiles();

});
