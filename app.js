// ──────────────────────────────────────────────
// School Admission Age Calculator — Core Logic
// ──────────────────────────────────────────────

// Reusable empty state HTML
const emptyStateHTML = `
    <div class="empty-state">
        <i class='bx bx-info-circle'></i>
        Enter a birthdate to see the suggested class here.
    </div>
`;

// Show empty state on load
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("calculator_output").innerHTML = emptyStateHTML;
});

// Clear the input and restore empty state
function clearCalculator() {
    document.getElementById("birthdate").value = "";
    document.getElementById("calculator_output").innerHTML = emptyStateHTML;
}

// Main Calculation Logic
document.getElementById("calculateButton").addEventListener("click", function () {
    const birthdateInput = document.getElementById("birthdate").value;

    // ── SWAL Validations ──
    if (!birthdateInput) {
        Swal.fire({ icon: 'warning', title: 'Missing Info', text: 'Please select a valid date.', confirmButtonColor: '#094f93' });
        return;
    }

    const today = new Date();
    const birthDate = new Date(birthdateInput);

    if (isNaN(birthDate.getTime())) {
        Swal.fire({ icon: 'error', title: 'Invalid Date', text: 'Invalid date format. Please enter a correct birthdate.', confirmButtonColor: '#094f93' });
        return;
    }
    if (birthDate > today) {
        Swal.fire({ icon: 'warning', title: 'Future Date', text: 'Please select a date before today.', confirmButtonColor: '#094f93' });
        return;
    }

    const minValidYear = 1900;
    if (birthDate.getFullYear() < minValidYear) {
        Swal.fire({ icon: 'warning', title: 'Invalid Year', text: `Please select a date after ${minValidYear}.`, confirmButtonColor: '#094f93' });
        return;
    }

    const ageInYears = today.getFullYear() - birthDate.getFullYear();
    if (ageInYears < 0) {
        Swal.fire({ icon: 'error', title: 'Negative Age', text: 'Birthdate leads to negative age. Please check again.', confirmButtonColor: '#094f93' });
        return;
    }
    if (ageInYears > 100) {
        Swal.fire({ icon: 'warning', title: 'Age Over 100', text: 'Entered birthdate suggests age over 100. Please verify.', confirmButtonColor: '#094f93' });
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

    // ── 2. Age on 31st December Calculation ──
    const current_year = today.getFullYear();
    const specificDate = new Date(current_year, 11, 31);

    let years_1 = specificDate.getFullYear() - birthDate.getFullYear();
    let months_1 = specificDate.getMonth() - birthDate.getMonth();
    let days_1 = specificDate.getDate() - birthDate.getDate();

    if (months_1 < 0 || (months_1 === 0 && days_1 < 0)) {
        years_1--;
        months_1 += 12;
    }
    if (days_1 < 0) {
        const daysInLastMonthSpecific = new Date(specificDate.getFullYear(), specificDate.getMonth(), 0).getDate();
        days_1 += daysInLastMonthSpecific;
        months_1--;
    }
    const age_on_date = `${years_1} Y, ${months_1} M, ${days_1} D`;

    // ── 3. Class Proposal Logic ──
    let show_class = "";
    const isMidYearOrOlder = (m) => m >= 6;

    if (years_1 < 3) {
        show_class = "VISIT NEXT YEAR";
    } else if (years_1 >= 16) {
        show_class = "OUT OF SCHOOL";
    } else {
        switch (years_1) {
            case 3:  show_class = "Nursery"; break;
            case 4:  show_class = isMidYearOrOlder(months_1) ? "LKG" : "Nursery / LKG"; break;
            case 5:  show_class = isMidYearOrOlder(months_1) ? "UKG" : "LKG / UKG"; break;
            case 6:  show_class = isMidYearOrOlder(months_1) ? "1ST" : "UKG / 1ST"; break;
            case 7:  show_class = isMidYearOrOlder(months_1) ? "2ND" : "1ST / 2ND"; break;
            case 8:  show_class = isMidYearOrOlder(months_1) ? "3RD" : "2ND / 3RD"; break;
            case 9:  show_class = isMidYearOrOlder(months_1) ? "4TH" : "3RD / 4TH"; break;
            case 10: show_class = isMidYearOrOlder(months_1) ? "5TH" : "4TH / 5TH"; break;
            case 11: show_class = isMidYearOrOlder(months_1) ? "6TH" : "5TH / 6TH"; break;
            case 12: show_class = isMidYearOrOlder(months_1) ? "7TH" : "6TH / 7TH"; break;
            case 13: show_class = isMidYearOrOlder(months_1) ? "8TH" : "7TH / 8TH"; break;
            case 14: show_class = isMidYearOrOlder(months_1) ? "9TH" : "8TH / 9TH"; break;
            case 15: show_class = isMidYearOrOlder(months_1) ? "10TH" : "9TH / 10TH"; break;
        }
    }

    // ── 4. Render output ──
    document.getElementById("calculator_output").innerHTML = `
        <table class="age-table">
            <tr>
                <td><i class='bx bx-calendar-check row-icon'></i> <strong>Current Age</strong></td>
                <td>${current_age}</td>
            </tr>
            <tr>
                <td><i class='bx bx-calendar-event row-icon'></i> <strong>Age on 31 Dec ${current_year}</strong></td>
                <td>${age_on_date}</td>
            </tr>
            <tr class="highlight-row">
                <td><i class='bx bx-book-open row-icon'></i> <strong>Suggested Class</strong></td>
                <td class="suggested-class">${show_class}</td>
            </tr>
        </table>
    `;

    // Animate the result in
    const table = document.querySelector('.age-table');
    if (table) {
        table.classList.add('fade-in');
    }
});

// ── Register Service Worker ──
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((reg) => console.log('Service Worker registered:', reg.scope))
            .catch((err) => console.error('SW registration failed:', err));
    });
}
