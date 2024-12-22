const postDiv = document.querySelector(".container");
console.log(postDiv.scrollWidth);
let scrollDirection = 1;

function scrollPost() {
  const maxScrollLeft = postDiv.scrollWidth - postDiv.clientWidth;
  if (scrollDirection === 1) {
    if (postDiv.scrollLeft >= maxScrollLeft) {
      scrollDirection = -1;
    }
  } else {
    if (postDiv.scrollLeft <= 0) {
      scrollDirection = 1;
    }
  }
  postDiv.scrollTo({
    left: postDiv.scrollLeft + 163 * scrollDirection,
    behavior: "smooth",
  });
}

setInterval(scrollPost, 2000);
