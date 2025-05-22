let currentStep = 0;
const steps = document.querySelectorAll(".step");
const stepCircles = document.querySelectorAll(".step-circle");
const stepLines = document.querySelectorAll(".step-line");
const noOrders = document.getElementById("no-orders");
const ordersTable = document.getElementById("ordersTable");
const checkoutBtn = document.getElementById("checkoutBtn");

document.addEventListener("DOMContentLoaded", function () {
    // Contact form handler
    const contactForm = document.getElementById("contactForm");

    function showError(inputElement, message) {
        const errorElement = document.getElementById(`${inputElement.id}-error`);
        if (errorElement) {
            errorElement.innerText = message;
            errorElement.style.display = "block";
        }
    }

    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const firstNameInput = document.getElementById("firstName");
            const lastNameInput = document.getElementById("lastName");
            const emailInput = document.getElementById("email");
            const phoneInput = document.getElementById("phone");
            const messageInput = document.getElementById("message");

            const firstName = firstNameInput.value.trim();
            const lastName = lastNameInput.value.trim();
            const email = emailInput.value.trim();
            const phone = phoneInput.value.trim();
            const message = messageInput.value.trim();

            let isValid = true;

            // Clear previous error messages
            const fields = [firstNameInput, lastNameInput, emailInput, phoneInput, messageInput];
            fields.forEach(field => {
                const errorElement = document.getElementById(`${field.id}-error`);
                if (errorElement) {
                    errorElement.innerText = "";
                    errorElement.style.display = "none";
                }
            });

            // Validate First Name
            if (firstName.length < 2 || firstName.length > 50) {
                isValid = false;
                showError(firstNameInput, "First name must be between 2 and 50 characters.");
            }

            // Validate Last Name
            if (lastName.length < 2 || lastName.length > 50) {
                isValid = false;
                showError(lastNameInput, "Last name must be between 2 and 50 characters.");
            }

            // Validate Email
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                isValid = false;
                showError(emailInput, "Invalid email format.");
            }

            // Validate Phone (exactly 9 digits)
            const phonePattern = /^\d{9}$/;
            if (!phonePattern.test(phone)) {
                isValid = false;
                showError(phoneInput, "Phone number must contain exactly 9 digits.");
            }

            // Validate Message
            if (message.length < 10) {
                isValid = false;
                showError(messageInput, "Message must be at least 10 characters.");
            }

            if (!isValid) return;

            const data = { firstName, lastName, email, phone, message };

            fetch("http://localhost:3000/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(response => {
                    alert(`Thank you, ${ data.firstName }!\nYour message has been successfully sent.`);
                    contactForm.reset();

                    // Clear error messages after reset
                    fields.forEach(field => {
                        const errorElement = document.getElementById(`${field.id}-error`);
                        if (errorElement) {
                            errorElement.innerText = "";
                            errorElement.style.display = "none";
                        }
                    });
                })
                .catch(error => {
                    console.error("Error:", error);
                    alert("Something went wrong!");
                });
        });
    }


    function showError(inputElement, message) {
        const errorElement = document.getElementById(`${inputElement.id}-error`);
        if (errorElement) {
            errorElement.innerText = message;
            errorElement.style.display = "block";
        }
    }


    // Multi-step form handler
    const multiStepForm = document.getElementById('multiStepForm');
    if (multiStepForm) {
        multiStepForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const formData = new FormData(this);
            formData.append('clothingType', document.getElementById('clothing-type').value);

            try {
                const response = await fetch('http://localhost:3000/submit', {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.text();
                alert(result);
                this.reset();
                showStep(0);
            } catch (error) {
                console.error('Error:', error);
                alert('Submission failed!');
            }
        });
    }

    showStep(currentStep);
});


function showStep(step) {
    steps.forEach((s, index) => {
        s.classList.toggle("active", index === step);
    });

    stepCircles.forEach((circle, index) => {
        circle.classList.toggle("active", index <= step);
    });

    stepLines.forEach((line, index) => {
        line.style.backgroundColor = index < step ? "#EAAEB2" : "#ddd";
        line.style.transition = "background-color 0.5s ease-in-out";
    });
}

function nextStep() {
    const currentFieldset = steps[currentStep];
    const inputs = currentFieldset.querySelectorAll("input, select, textarea");
    let isValid = true;

    inputs.forEach(input => {
        const errorElement = document.getElementById(`${input.id}-error`);
        if (errorElement) {
            errorElement.style.display = "none";
            errorElement.innerText = "";
        }

        if (input.type === "file" && input.files.length === 0) {
            isValid = false;
            if (errorElement) {
                errorElement.style.display = "block";
                errorElement.innerText = "Please upload a file.";
            }
        } else if ((input.tagName === "TEXTAREA" || input.type === "text") && (input.value.trim() === "" || input.value.length < 2 || input.value.length > 50)) {
            isValid = false;
            if (errorElement) {
                errorElement.style.display = "block";
                errorElement.innerText = "Text must be between 2 and 50 characters.";
            }
        } else if (input.type === "email") {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(input.value)) {
                isValid = false;
                if (errorElement) {
                    errorElement.style.display = "block";
                    errorElement.innerText = "Invalid email format.";
                }
            }
        } else if (input.id === "phone") {
            const phonePattern = /^\d{8,15}$/;
            if (!phonePattern.test(input.value)) {
                isValid = false;
                if (errorElement) {
                    errorElement.style.display = "block";
                    errorElement.innerText = "Phone number must contain 8 to 15 digits.";
                }
            }
        } else if (!input.checkValidity()) {
            isValid = false;
            input.reportValidity();
        }
    });

    if (isValid && currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
    }
}

function prevStep() {
    if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
    }
}
document.querySelectorAll(".button-next").forEach(button => {
    button.addEventListener("click", nextStep);
});

document.querySelectorAll(".button-prev").forEach(button => {
    button.addEventListener("click", prevStep);
});

if (order) {
    if (noOrders) noOrders.style.display = "none";
    if (ordersTable) ordersTable.style.display = "table";
    if (checkoutBtn) checkoutBtn.style.display = "block";

    const cells = document.querySelectorAll("#ordersTable td");
    if (cells.length >= 8) {
        cells[0].textContent = order.name;
        cells[1].textContent = order.email;
        cells[2].textContent = order.phone;
        cells[3].textContent = order.clothing_type;
        cells[4].textContent = order.fabric;
        cells[5].textContent = order.color;
        cells[6].textContent = order.design;
        cells[7].textContent = order.description;
    }

    const orderDiv = document.querySelector(".order");
    if (orderDiv) orderDiv.style.display = "block";
} else {
    if (ordersTable) ordersTable.style.display = "none";
    if (noOrders) noOrders.style.display = "block";
    if (checkoutBtn) checkoutBtn.style.display = "none";
}



