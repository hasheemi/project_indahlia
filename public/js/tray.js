let switchButton = document.querySelectorAll(".switch .box");
let tray = document.querySelectorAll(".tray");

switchButton.forEach((e) => {
  e.onclick = () => {
    // Sembunyikan semua elemen tray
    tray.forEach((u) => {
      u.classList.add("hidden");
    });

    // Tampilkan elemen tray dengan target yang sesuai
    let targetClass = e.getAttribute("target");
    let targetElement = document.querySelector(`.tray.${targetClass}`);
    if (targetElement) {
      targetElement.classList.remove("hidden");
    }
  };
});
