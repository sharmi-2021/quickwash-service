let selectedProblemText = "";

/**
 * 1. Problem Selection Logic
 * Handles UI active state and stores selected value.
 */
function selectProblem(el, problem) {
    // Remove active class from all cards
    document.querySelectorAll('.problem-card').forEach(card => card.classList.remove('active'));
    
    // Add active class to selected card
    el.classList.add('active');
    selectedProblemText = problem;
    
    // UI Feedback for selection
    const selectionDisplay = document.getElementById('selectedProblem');
    if (selectionDisplay) {
        selectionDisplay.innerHTML = `✅ Selected Service: <strong>${problem}</strong>`;
        selectionDisplay.style.color = "#2e7d32"; // Professional Green
    }
}

/**
 * 2. Main Submit Function
 * Handles WhatsApp redirection and Backend API synchronization.
 */
async function submitBooking() {
    // Collect Form Data
    const formData = {
        name: document.getElementById('custName').value.trim(),
        phone: document.getElementById('custPhone').value.trim(),
        address: document.getElementById('custAddress').value.trim(),
        machineType: document.getElementById('machineType').value,
        brand: document.getElementById('brand').value,
        date: document.getElementById('bookingDate').value,
        problem: selectedProblemText || "General Service"
    };

    // Validation Check
    if (!formData.name || !formData.phone || !formData.address) { 
        alert("⚠️ Required Fields Missing: Please provide Name, Phone, and Address."); 
        return; 
    }

    // WhatsApp Message Construction
    const message = `*NEW BOOKING REQUEST*%0A%0A` +
                    `*Name:* ${formData.name}%0A` +
                    `*Phone:* ${formData.phone}%0A` +
                    `*Machine:* ${formData.machineType || "Standard"}%0A` +
                    `*Brand:* ${formData.brand || "Not Specified"}%0A` +
                    `*Issue:* ${formData.problem}%0A` +
                    `*Date:* ${formData.date || "ASAP"}%0A` +
                    `*Address:* ${formData.address}`;
    
    const waURL = `https://wa.me/919445237143?text=${message}`;

    // Step 1: Open WhatsApp Communication
    window.open(waURL, '_blank');

    // Step 2: Backend API Sync (Email Notification)
    try {
        console.log("System: Initiating background sync with API...");
        
        const response = await fetch('https://quickwash-service.vercel.app/api/booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            console.log("System Success: Email notification triggered successfully.");
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.warn("System Warning: Backend accepted request but failed to send email.", errorData);
        }

    } catch (err) {
        console.error("System Error: Network failure or API endpoint unreachable.", err.message);
    }
}