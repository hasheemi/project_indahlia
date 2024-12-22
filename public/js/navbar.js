const jumbo = document.querySelector(".hero");
const banner = document.querySelector(".header");
const navbar = document.querySelector(".navbar");
const navbarList = document.querySelector(".navbar-nav");
const navbarBtn = document.querySelector("#menu i");

console.log(jumbo);
const observer = new IntersectionObserver(
  (e) => {
    const [entry] = e;
    if (!entry.isIntersecting) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  },
  { threshold: 0.8 }
);
observer.observe(jumbo || banner);

document.querySelector("#menu").onclick = () => {
  navbarList.classList.toggle("active");
  navbarBtn.classList.toggle("bi-list");
  navbarBtn.classList.toggle("bi-x-lg");
};
