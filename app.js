// ──────────────────────────────────────────────
// School Admission Age Calculator — Core Logic
// ──────────────────────────────────────────────

// Reusable empty state HTML
const emptyStateHTML = `
    <div class="empty-state">
        <img src="icons/hero.png" alt="School illustration" class="empty-state-img">
        <i class='bx bx-info-circle bounce-icon'></i>
        Enter a birthdate to see the suggested class here.
    </div>
`;

// Show empty state on load
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("calculator_output").innerHTML = emptyStateHTML;
});

// ── Smooth State Transition Helper ──
async function updateResultArea(newHTML) {
    const outputContainer = document.getElementById("calculator_output");
    const wrapper = outputContainer.parentElement; // the result-card

    // 1. Lock the current height before we destroy the DOM
    const currentHeight = wrapper.offsetHeight;
    wrapper.style.height = currentHeight + 'px';

    // 2. Fade out current content
    if (outputContainer.children.length > 0) {
        outputContainer.firstElementChild.classList.add('fade-out');
        await new Promise(r => setTimeout(r, 200)); // wait for fade out
    }

    // 3. Inject new HTML hidden to calculate its target height
    outputContainer.style.opacity = '0';
    outputContainer.innerHTML = newHTML;

    // Remove any previous fade classes from the new elements so they can trigger again
    const newChild = outputContainer.firstElementChild;
    if (newChild) newChild.classList.remove('fade-in', 'fade-out');

    // Calculate new height naturally
    wrapper.style.height = 'auto'; // release lock temporarily
    const targetHeight = wrapper.offsetHeight;

    // Reset lock to current height then animate to target
    wrapper.style.height = currentHeight + 'px';
    
    // Force DOM reflow
    wrapper.offsetHeight; 

    // Animate wrapper height
    wrapper.style.height = targetHeight + 'px';

    // Animate content back in
    outputContainer.style.opacity = '1';
    if (newChild) newChild.classList.add('fade-in');

    // Clean up fixed height locks after transition so it remains responsive
    setTimeout(() => {
        wrapper.style.height = 'auto';
    }, 400);
}

// Clear the input and restore empty state
function clearCalculator() {
    const dateInput = document.getElementById("birthdate");
    const outputContainer = document.getElementById("calculator_output");
    
    // Check if it's already in the empty state
    if (!dateInput.value && outputContainer.querySelector('.empty-state')) {
        return; // Do nothing, avoid redundant animation
    }
    
    dateInput.value = "";
    updateResultArea(emptyStateHTML);
}

// Main Calculation Logic
document.getElementById("calculateButton").addEventListener("click", function () {
    const birthdateInput = document.getElementById("birthdate").value;

    // ── SWAL Validations ──
    if (!birthdateInput) {
        Swal.fire({ icon: 'warning', title: 'Missing Info', text: 'Please select a valid date.', confirmButtonColor: '#094f93', heightAuto: false });
        return;
    }

    const today = new Date();

    // PATCH 1: Fix UTC Timezone shift bug by splitting the string and parsing locally
    const [bYear, bMonth, bDay] = birthdateInput.split('-').map(Number);
    const birthDate = new Date(bYear, bMonth - 1, bDay);

    if (isNaN(birthDate.getTime())) {
        Swal.fire({ icon: 'error', title: 'Invalid Date', text: 'Invalid date format. Please enter a correct birthdate.', confirmButtonColor: '#094f93', heightAuto: false });
        return;
    }
    if (birthDate > today) {
        Swal.fire({ icon: 'warning', title: 'Future Date', text: 'Please select a date before today.', confirmButtonColor: '#094f93', heightAuto: false });
        return;
    }

    const minValidYear = 1900;
    if (birthDate.getFullYear() < minValidYear) {
        Swal.fire({ icon: 'warning', title: 'Invalid Year', text: `Please select a date after ${minValidYear}.`, confirmButtonColor: '#094f93', heightAuto: false });
        return;
    }

    const ageInYears = today.getFullYear() - birthDate.getFullYear();
    if (ageInYears < 0) {
        Swal.fire({ icon: 'error', title: 'Negative Age', text: 'Birthdate leads to negative age. Please check again.', confirmButtonColor: '#094f93', heightAuto: false });
        return;
    }
    if (ageInYears > 100) {
        Swal.fire({ icon: 'warning', title: 'Age Over 100', text: 'Entered birthdate suggests age over 100. Please verify.', confirmButtonColor: '#094f93', heightAuto: false });
        return;
    }

    // ── 1. Current Age Calculation ──
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (months < 0 || (months === 0 && days < 0)) {
        years--;
        months += 12;
    }
    if (days < 0) {
        const daysInLastMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        days += daysInLastMonth;
        months--;
    }
    const current_age = `${years} Y, ${months} M, ${days} D`;

    // ── 2. Age on 31st December Calculation (Smart Target Year + Strict Math) ──
    let target_year = today.getFullYear();

    // PATCH 2: If calculating in Oct (9), Nov (10), or Dec (11), assume admissions for next year
    if (today.getMonth() >= 9) {
        target_year += 1;
    }

    const specificDate = new Date(target_year, 11, 31); // Dec 31st of target year

    const years_1 = specificDate.getFullYear() - birthDate.getFullYear();
    const months_1 = specificDate.getMonth() - birthDate.getMonth();
    const days_1 = specificDate.getDate() - birthDate.getDate();

    const age_on_date = `${years_1} Y, ${months_1} M, ${days_1} D`;

    // ── 3. Class Proposal Logic (Strict Gov Criteria: X Years, 11 Months, 15 Days) ──
    let show_class = "";

    const meetsGovCriteria = (target_years) => {
        return (years_1 > target_years) || (years_1 === target_years && months_1 === 11 && days_1 >= 15);
    };

    if (years_1 >= 16) {
        show_class = "OUT OF SCHOOL";
    } else if (meetsGovCriteria(14)) {
        show_class = "10th Standard";
    } else if (meetsGovCriteria(13)) {
        show_class = "9th Standard";
    } else if (meetsGovCriteria(12)) {
        show_class = "8th Standard";
    } else if (meetsGovCriteria(11)) {
        show_class = "7th Standard";
    } else if (meetsGovCriteria(10)) {
        show_class = "6th Standard";
    } else if (meetsGovCriteria(9)) {
        show_class = "5th Standard";
    } else if (meetsGovCriteria(8)) {
        show_class = "4th Standard";
    } else if (meetsGovCriteria(7)) {
        show_class = "3rd Standard";
    } else if (meetsGovCriteria(6)) {
        show_class = "2nd Standard";
    } else if (meetsGovCriteria(5)) {
        show_class = "1st Standard";
    } else if (meetsGovCriteria(4)) {
        show_class = "UKG";
    } else if (meetsGovCriteria(3)) {
        show_class = "LKG";
    } else if (meetsGovCriteria(2)) {
        show_class = "Nursery";
    } else if (meetsGovCriteria(1)) {
        show_class = "Playgroup";
    } else {
        show_class = "VISIT NEXT YEAR";
    }

    // ── 4. Render output gracefully ──
    updateResultArea(`
        <table class="age-table">
            <tr class="row-animate">
                <td><i class='bx bx-calendar-check row-icon'></i> <strong>Current Age</strong></td>
                <td>${current_age}</td>
            </tr>
            <tr class="row-animate">
                <td><i class='bx bx-calendar-event row-icon'></i> <strong>Age on 31 Dec ${target_year}</strong></td>
                <td>${age_on_date}</td>
            </tr>
            <tr class="highlight-row row-animate">
                <td><i class='bx bx-book-open row-icon'></i> <strong>Suggested Class</strong></td>
                <td class="suggested-class pulse">${show_class}</td>
            </tr>
        </table>
    `);
});

// ── Register Service Worker + Active Update Flow ──
let refreshing = false;
let newWorker = null;

if ('serviceWorker' in navigator) {
    // Auto-reload when the new SW takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            refreshing = true;
            window.location.reload();
        }
    });

    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then((reg) => {
            console.log('Service Worker registered:', reg.scope);

            // Force the browser to check for a new SW immediately
            reg.update();

            // Listen for a brand new SW being found
            reg.addEventListener('updatefound', () => {
                newWorker = reg.installing;

                newWorker.addEventListener('statechange', () => {
                    // Once the new SW is installed and waiting, run version check
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // A new SW is ready. Check version.json to decide whether to prompt.
                        checkForAppUpdate(newWorker);
                    }
                });
            });

            // Also check if a SW is ALREADY waiting (e.g. from a previous visit)
            if (reg.waiting) {
                checkForAppUpdate(reg.waiting);
            }
        }).catch((err) => console.error('SW registration failed:', err));
    });
}

// ── Version Check + Update Prompt ──
async function checkForAppUpdate(waitingSW) {
    try {
        const response = await fetch('/version.json?t=' + new Date().getTime());
        if (!response.ok) return;

        const data = await response.json();
        const newVersion = data.version;
        const currentVersion = localStorage.getItem('appVersion');

        if (!currentVersion) {
            // First visit — store silently, activate the new SW right away
            localStorage.setItem('appVersion', newVersion);
            if (waitingSW) waitingSW.postMessage({ type: 'SKIP_WAITING' });
            return;
        }

        if (currentVersion !== newVersion) {
            localStorage.setItem('appVersion', newVersion);

            Swal.fire({
                icon: 'info',
                title: 'Update Available',
                text: 'A new version of the app is ready.',
                confirmButtonText: 'Update Now',
                confirmButtonColor: '#094f93',
                allowOutsideClick: false,
                allowEscapeKey: false,
                heightAuto: false
            }).then((result) => {
                if (result.isConfirmed) {
                    // Tell the waiting SW to activate — controllerchange handles reload
                    if (waitingSW) {
                        waitingSW.postMessage({ type: 'SKIP_WAITING' });
                    } else {
                        window.location.reload(true);
                    }
                }
            });
        }
    } catch (err) {
        console.log('Update check skipped:', err.message);
    }
}

