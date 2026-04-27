let selectedProblemText = "";

// 1. Problem Selection logic
function selectProblem(el, problem) {
    document.querySelectorAll('.problem-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    selectedProblemText = problem;
    
    const sp = document.getElementById('selectedProblem');
    if (sp) {
        sp.innerHTML = `✅ Selected: <strong>${problem}</strong>`;
        sp.style.color = "green";
    }
}

// 2. MAIN SUBMIT FUNCTION
async function submitBooking() {
    const name        = document.getElementById('custName').value.trim();
    const phone       = document.getElementById('custPhone').value.trim();
    const address     = document.getElementById('custAddress').value.trim();
    const machineType = document.getElementById('machineType').value;
    const brand       = document.getElementById('brand').value;
    const date        = document.getElementById('bookingDate').value;

    // Basic Validation
    if (!name || !phone || !address) { 
        alert("⚠️ Name, Phone, and Address fill pannunga!"); 
        return; 
    }

    // WhatsApp Message Layout
    const message = `*NEW BOOKING REQUEST*%0A%0A` +
                    `*Name:* ${name}%0A` +
                    `*Phone:* ${phone}%0A` +
                    `*Machine:* ${machineType || "Not Selected"}%0A` +
                    `*Brand:* ${brand || "Not Selected"}%0A` +
                    `*Issue:* ${selectedProblemText || "General Service"}%0A` +
                    `*Date:* ${date || "As soon as possible"}%0A` +
                    `*Address:* ${address}`;
    
    const waURL = `https://wa.me/919445237143?text=${message}`;

    // Step 1: Open WhatsApp
    window.open(waURL, '_blank');

    // Step 2: Backend Sync (Email)
    try {
        await fetch('/api/booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name, 
                phone, 
                address, 
                machineType, 
                brand, 
                problem: selectedProblemText,
                date
            })
        });
    } catch (err) {
        console.log("Backend offline, but WhatsApp triggered.");
    }
}