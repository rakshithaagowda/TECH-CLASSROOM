const resources = {
  python: [
    { title: "Python Notes (PDF)", link: "../resources/python_notes.pdf" },
    { title: "Python Basics Video", link: "https://youtu.be/_uQrJ0TkZlc" },
    { title: "Python Cheat Sheet", link: "https://www.pythoncheatsheet.org/" }
  ],
  ds: [
    { title: "DSA Notes PDF", link: "../resources/ds_notes.pdf" },
    { title: "DSA Full Course (Video)", link: "https://youtu.be/sVxBVvlnJsM" }
  ],
  java: [
    { title: "Java Notes PDF", link: "../resources/java_notes.pdf" },
    { title: "Java Tutorial (Video)", link: "https://youtu.be/grEKMHGYyns" }
  ],
  cn: [
    { title: "Computer Networks Notes", link: "../resources/cn_notes.pdf" },
    { title: "CN Tutorial (Video)", link: "https://youtu.be/IPvYjXCsTg8" }
  ],
  os: [
    { title: "Operating System Notes (PDF)", link: "../resources/os_notes.pdf" },
    { title: "OS Tutorial Video", link: "https://youtu.be/26QPDBe-NB8" }
  ]
};

document.querySelectorAll(".resource-card").forEach(card => {
  card.addEventListener("click", () => {
    const subject = card.dataset.subject;
    const list = resources[subject];

    document.getElementById("resourceList").style.display = "block";
    document.getElementById("resourceTitle").textContent = subject.toUpperCase() + " Resources";

    const ul = document.getElementById("resourceItems");
    ul.innerHTML = "";

    list.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${item.link}" target="_blank">${item.title}</a>`;
      ul.appendChild(li);
    });
  });
});
