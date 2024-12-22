// let zone = document.querySelector(".file-zone");
// let placeholder = document.querySelector(".uplace");
// let file = document.getElementById("photo");
// let accept = ["image/jpeg", "image/png", "image/jpg"];

// zone.ondrop = (e) => {
//   zone.classList.remove("gray");
//   placeholder.classList.add("hidden");
// };
// zone.ondragleave = (e) => {
//   e.preventDefault();
//   e.stopPropagation();

//   zone.classList.remove("gray");
// };
// zone.ondragover = (e) => {
//   e.preventDefault();
//   e.stopPropagation();

//   zone.classList.add("gray");
// };

// function readFile(file) {
//   let reader = new FileReader();
//   reader.onload = () => {
//     zone.classList.remove("gray");
//     placeholder.classList.add("hidden");
//     let test = document.createElement("img");
//     test.src = reader.result;
//     test.alt = file.target.files[0].name;
//     test.classList.add("preview");
//     test.setAttribute("id", "preview");
//     zone.insertBefore(test, zone.firstElementChild);
//     reset.classList.remove("hidden");
//   };
//   reader.readAsDataURL(file.target.files[0]);
// }
// file.onchange = (e) => {
//   if (accept.includes(e.target.files[0].type)) readFile(e);
//   else {
//     file.value = "";
//     placeholder.classList.add("hidden");
//     placeholder.innerText = "Please upload image file !";
//   }
// };
let accept = ["image/jpeg", "image/png", "image/jpg"];

document.querySelectorAll(".file-zone").forEach((zone) => {
  let placeholder = zone.querySelector(".uplace");
  let fileInput = zone.querySelector("input[type='file']");

  zone.ondrop = (e) => {
    e.preventDefault();
    zone.classList.remove("gray");
    placeholder.classList.add("hidden");
    let files = Array.from(e.dataTransfer.files);
    handleFiles(files, zone, placeholder);
  };

  zone.ondragleave = (e) => {
    e.preventDefault();
    zone.classList.remove("gray");
  };

  zone.ondragover = (e) => {
    e.preventDefault();
    zone.classList.add("gray");
  };

  fileInput.onchange = (e) => {
    let files = Array.from(e.target.files);
    handleFiles(files, zone, placeholder);
  };
});

function handleFiles(files, zone, placeholder) {
  files.forEach((file) => {
    if (accept.includes(file.type)) {
      let reader = new FileReader();
      reader.onload = () => {
        placeholder.classList.add("hidden");
        let img = document.createElement("img");
        img.src = reader.result;
        img.alt = file.name;
        img.classList.add("preview");
        img.setAttribute("id", "preview");
        zone.insertBefore(img, zone.firstElementChild);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload an image file!");
    }
  });
}
