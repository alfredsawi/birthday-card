const intro =
    document.getElementById("intro");

const birthdayCard =
    document.getElementById("birthdayCard");

const openBtn =
    document.getElementById("openBtn");

const finishBtn =
    document.getElementById("finishBtn");

const soundBtn =
    document.getElementById("soundBtn");

const music =
    document.getElementById("birthdayMusic");

const confetti =
    document.getElementById("confetti");

const balloons =
    document.querySelector(".balloons");


let musicStarted = false;


/* =========================
   OUVERTURE
========================= */

openBtn.addEventListener(
    "click",
    openCard
);


function openCard() {

    intro.style.display = "none";

    birthdayCard.classList.add("show");

    balloons.classList.add("active");

    startMusic();

    launchConfetti();

}


/* =========================
   MUSIQUE
========================= */

function startMusic() {

    if (musicStarted) {
        return;
    }

    music.volume = 0.35;

    music.muted = false;

    music.play()
        .then(() => {

            musicStarted = true;

            soundBtn.textContent = "🔊";

        })
        .catch(() => {

            /*
             * Certains navigateurs
             * peuvent bloquer la lecture.
             */

            soundBtn.textContent = "🔇";

        });

}


/* =========================
   BOUTON SON
========================= */

soundBtn.addEventListener(
    "click",
    toggleSound
);


function toggleSound() {

    if (!musicStarted) {

        music.volume = 0.35;

        music.muted = false;

        music.play()
            .then(() => {

                musicStarted = true;

                soundBtn.textContent = "🔊";

            })
            .catch(() => {

                soundBtn.textContent = "🔇";

            });

        return;
    }


    music.muted =
        !music.muted;


    soundBtn.textContent =
        music.muted
            ? "🔇"
            : "🔊";

}


/* =========================
   CONFETTIS
========================= */

function launchConfetti() {

    confetti.innerHTML = "";


    const colors = [

        "#a875ff",
        "#ef9ddd",
        "#8275ff",
        "#e8b1ef",
        "#ffffff",
        "#c89bf0"

    ];


    for (
        let i = 0;
        i < 100;
        i++
    ) {

        const piece =
            document.createElement("div");


        piece.className =
            "confetti";


        piece.style.left =
            Math.random() * 100 + "%";


        piece.style.background =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];


        piece.style.animationDuration =
            (
                3 +
                Math.random() * 4
            ) + "s";


        piece.style.animationDelay =
            (
                Math.random() * 1.5
            ) + "s";


        piece.style.width =
            (
                5 +
                Math.random() * 5
            ) + "px";


        piece.style.height =
            (
                8 +
                Math.random() * 8
            ) + "px";


        piece.style.transform =
            `rotate(
                ${Math.random() * 360}deg
            )`;


        confetti.appendChild(piece);

    }


    setTimeout(() => {

        confetti.innerHTML = "";

    }, 8500);

}


/* =========================
   TERMINER
========================= */

finishBtn.addEventListener(
    "click",
    closeCard
);


function closeCard() {

    birthdayCard.style.animation =
        "cardClose .8s ease forwards";


    music.pause();

    music.currentTime = 0;

    music.muted = true;

    balloons.classList.remove(
        "active"
    );

    confetti.innerHTML = "";


    setTimeout(() => {

        birthdayCard.style.display =
            "none";

        birthdayCard.classList.remove(
            "show"
        );

        birthdayCard.style.animation =
            "";

        intro.style.display =
            "flex";

        soundBtn.textContent =
            "🔇";

        musicStarted = false;

    }, 800);

}


/* =========================
   ANIMATION FERMETURE
========================= */

const closeStyle =
document.createElement("style");


closeStyle.textContent = `

@keyframes cardClose {

    from {

        opacity: 1;

        transform:
            translateY(0)
            scale(1);

    }

    to {

        opacity: 0;

        transform:
            translateY(25px)
            scale(.97);

    }

}

`;


document.head.appendChild(
    closeStyle
);