let currentStep = 0;
const steps = document.querySelectorAll(".step");
const stepCircles = document.querySelectorAll(".step-circle");
const stepLines = document.querySelectorAll(".step-line");

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

        if (errorElement) errorElement.style.display = "none"; // Hide any previous errors

        if (input.type === "file") {
            if (input.files.length === 0) {
                isValid = false;
                if (errorElement) errorElement.style.display = "block";
            }
        } else if (input.tagName === "TEXTAREA") {
            if (input.value.trim() === "") {
                isValid = false;
                if (errorElement) errorElement.style.display = "block";
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

// Show the first step when the page loads
showStep(currentStep);

// Attach event listeners
document.querySelectorAll(".button-next").forEach(button => {
    button.addEventListener("click", nextStep);
});

document.querySelectorAll(".button-prev").forEach(button => {
    button.addEventListener("click", prevStep);
});
