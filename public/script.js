 // ========================================
// Mobile Menu
// ========================================

const menuBtn = document.getElementById("menuBtn");
const navbar = document.getElementById("navbar");

menuBtn.addEventListener("click", () => {

    navbar.classList.toggle("active");

});


// Mobile menu থেকে link click করলে menu বন্ধ হবে

document.querySelectorAll(".navbar a").forEach(link => {

    link.addEventListener("click", () => {

        navbar.classList.remove("active");

    });

});


// ========================================
// Dark / Light Theme
// ========================================

const themeBtn = document.getElementById("themeBtn");

// আগের Theme localStorage থেকে নেওয়া
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {

    document.body.classList.add("dark");

    themeBtn.textContent = "☀️";

}


// Theme Button click

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {

        themeBtn.textContent = "☀️";

        localStorage.setItem("theme", "dark");

    } else {

        themeBtn.textContent = "🌙";

        localStorage.setItem("theme", "light");

    }

});


// ========================================
// Current Year
// ========================================

document.getElementById("year").textContent =
    new Date().getFullYear();


// ========================================
// Load Projects
// Backend API থেকে project নেওয়া
// ========================================

const projectsContainer =
    document.getElementById("projectsContainer");


async function loadProjects() {

    try {

        const response =
            await fetch("/api/projects");

        const data =
            await response.json();

        if (!data.success) {

            throw new Error("Project load failed");

        }

        projectsContainer.innerHTML = "";

        data.projects.forEach(project => {

            // Technology আলাদা করা
            const technologies =
                project.technologies
                    .split(",")
                    .map(item => item.trim());

            const techHTML =
                technologies
                    .map(
                        tech =>
                            `<span class="tech">${tech}</span>`
                    )
                    .join("");


            const card = document.createElement("article");

            card.className =
                "project-card reveal";


            card.innerHTML = `

                <img
                    src="${project.image}"
                    alt="${project.title}"
                    class="project-image"
                    loading="lazy"
                >

                <div class="project-content">

                    <h3>
                        ${project.title}
                    </h3>

                    <p>
                        ${project.description}
                    </p>

                    <div class="tech-list">
                        ${techHTML}
                    </div>

                    <div class="project-links">

                        ${
                            project.github
                            ? `
                                <a
                                    href="${project.github}"
                                    target="_blank"
                                >
                                    GitHub
                                </a>
                            `
                            : ""
                        }

                        ${
                            project.demo
                            ? `
                                <a
                                    href="${project.demo}"
                                    target="_blank"
                                >
                                    Live Demo
                                </a>
                            `
                            : ""
                        }

                    </div>

                </div>
            `;

            projectsContainer.appendChild(card);

        });


        // নতুন project-গুলোতে animation
        observeRevealElements();


    } catch (error) {

        console.error(error);

        projectsContainer.innerHTML = `

            <div class="loading">

                Project load করা যায়নি।

                <br>

                কিছুক্ষণ পরে আবার চেষ্টা করুন।

            </div>

        `;

    }

}


// Page load হলে Project নেওয়া হবে

loadProjects();

// ========================================
// Contact Form (Web3Forms)
// ========================================

const contactForm =
    document.getElementById("contactForm");

const formMessage =
    document.getElementById("formMessage");


contactForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const submitButton =
        contactForm.querySelector(".submit-btn");

    const formData =
        new FormData(contactForm);

    const data = {
        access_key: "febf082c-eaac-460e-a53d-40a2640605de",
        name: formData.get("name"),
        email: formData.get("email"),
        subject: formData.get("subject"),
        message: formData.get("message")
    };

    try {

        submitButton.disabled = true;
        submitButton.innerText = "পাঠানো হচ্ছে...";

        const response = await fetch(
            "https://api.web3forms.com/submit",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(data)
            }
        );

        const result = await response.json();

        if (!result.success) {
            throw new Error("মেসেজ পাঠানো যায়নি।");
        }

        formMessage.textContent =
            "আপনার মেসেজ সফলভাবে পাঠানো হয়েছে।";

        formMessage.style.color = "#16a34a";

        contactForm.reset();

    } catch (error) {

        console.error(error);

        formMessage.textContent =
            "মেসেজ পাঠানো যায়নি। আবার চেষ্টা করুন।";

        formMessage.style.color = "#dc2626";

    } finally {

        submitButton.disabled = false;
        submitButton.innerText = "মেসেজ পাঠান";

    }

});
 

function observeRevealElements() {

    const elements =
        document.querySelectorAll(".reveal");


    const observer =
        new IntersectionObserver(

            (entries) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "active"
                        );

                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },

            {
                threshold: 0.15
            }

        );


    elements.forEach(element => {

        observer.observe(element);

    });

}


// প্রথমবার animation চালু

observeRevealElements();


// ========================================
// Header Shadow on Scroll
// ========================================

window.addEventListener("scroll", () => {

    const header =
        document.querySelector(".header");


    if (window.scrollY > 30) {

        header.style.boxShadow =
            "0 5px 25px rgba(0,0,0,0.08)";

    } else {

        header.style.boxShadow =
            "none";

    }

});
