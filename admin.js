async function loadBookings() {
  const res      = await fetch('/api/booking');
  const bookings = await res.json();

  let pending = 0, done = 0, revenue = 0;
  let html = '';

  bookings.forEach((b, i) => {
    if (b.status === 'Pending')   pending++;
    if (b.status === 'Completed') done++;
    revenue += b.amount || 0;

    const mapLink = b.googleMapLink !== 'Location not shared'
      ? `<a href="${b.googleMapLink}" target="_blank" class="map-link">📍 View Map</a>`
      : 'No location';

    html += `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${b.name}</strong></td>
        <td><a href="tel:${b.phone}">${b.phone}</a></td>
        <td>${b.problem}</td>
        <td>${b.brand || '-'} ${b.machineType ? '('+b.machineType+')' : ''}</td>
        <td>${b.date || '-'}<br><small>${b.slot || '-'}</small></td>
        <td>${mapLink}</td>
        <td><span class="badge ${b.paymentStatus === 'Paid' ? 'paid' : 'unpaid'}">
          ${b.paymentStatus}</span></td>
        <td>
          <select class="status-select" onchange="updateStatus('${b._id}', this.value)">
            <option ${b.status==='Pending'   ? 'selected':''}>Pending</option>
            <option ${b.status==='Confirmed' ? 'selected':''}>Confirmed</option>
            <option ${b.status==='Completed' ? 'selected':''}>Completed</option>
            <option ${b.status==='Cancelled' ? 'selected':''}>Cancelled</option>
          </select>
        </td>
      </tr>`;
  });

  document.getElementById('bookingsTable').innerHTML = html;
  document.getElementById('totalCount').innerText   = bookings.length;
  document.getElementById('pendingCount').innerText = pending;
  document.getElementById('doneCount').innerText    = done;
  document.getElementById('revenueCount').innerText = `₹${revenue}`;
}

async function loadPayments() {
  const res      = await fetch('/api/payment/history');
  const payments = await res.json();
  let html = '';

  payments.forEach((p, i) => {
    html += `
      <tr>
        <td>${i + 1}</td>
        <td>${p.name}</td>
        <td>${p.phone}</td>
        <td>${p.problem}</td>
        <td><strong>₹${p.amount}</strong></td>
        <td><small>${p.paymentId}</small></td>
        <td>${p.date}</td>
      </tr>`;
  });

  document.getElementById('paymentsTable').innerHTML = html;
}

async function updateStatus(id, status) {
  await fetch(`/api/booking/${id}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ status })
  });
  alert(`✅ Status updated to: ${status}`);
}

function showTab(tab, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('bookingsTab').style.display  = tab === 'bookings'  ? 'block' : 'none';
  document.getElementById('paymentsTab').style.display  = tab === 'payments'  ? 'block' : 'none';
  if (tab === 'payments') loadPayments();
}

// Page load
loadBookings();
// Auto refresh every 30 seconds
setInterval(loadBookings, 30000);