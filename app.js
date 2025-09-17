// App Data and State
let appState = {
  trips: [],
  expenses: [],
  categories: ["Food", "Transport", "Accommodation", "Entertainment", "Shopping", "Other"],
  tripPurposes: ["Business", "Personal", "Commute", "Other"],
  budgetLimits: {
    Food: 15000,
    Transport: 8000,
    Entertainment: 5000,
    Shopping: 10000,
    Other: 3000
  },
  mockOCRData: [
    {
      merchant: "Food Palace Restaurant",
      amount: 1250,
      items: ["Butter Chicken", "Naan", "Rice", "Lassi"],
      date: "2025-09-17",
      category: "Food"
    },
    {
      merchant: "Shell Petrol Pump",
      amount: 2500,
      items: ["Petrol 40L"],
      date: "2025-09-17",
      category: "Transport"
    }
  ],
  charts: {},
  map: null,
  tripLayer: null,
  expenseLayer: null,
  isGPSTracking: false,
  currentEditItem: null
};

// Sample data initialization
function initializeData() {
  appState.trips = [
    {
      id: 1,
      startLocation: "Home",
      endLocation: "Office",
      distance: 15.2,
      purpose: "Commute",
      date: "2025-09-17",
      time: "08:30",
      notes: "Morning commute via highway",
      startCoords: [28.6139, 77.2090],
      endCoords: [28.5355, 77.3910]
    },
    {
      id: 2,
      startLocation: "Office",
      endLocation: "Client Meeting",
      distance: 8.5,
      purpose: "Business",
      date: "2025-09-17",
      time: "14:00",
      notes: "Client presentation downtown",
      startCoords: [28.5355, 77.3910],
      endCoords: [28.6328, 77.2197]
    }
  ];

  appState.expenses = [
    {
      id: 1,
      description: "Lunch at restaurant",
      amount: 850,
      category: "Food",
      date: "2025-09-17",
      receipt: "receipt_lunch.jpg",
      location: [28.6139, 77.2090]
    },
    {
      id: 2,
      description: "Uber ride to meeting",
      amount: 320,
      category: "Transport",
      date: "2025-09-17",
      receipt: null,
      location: [28.5355, 77.3910]
    },
    {
      id: 3,
      description: "Coffee and snacks",
      amount: 250,
      category: "Food",
      date: "2025-09-16",
      receipt: "receipt_coffee.jpg",
      location: [28.6328, 77.2197]
    }
  ];
}

// Utility functions
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => {
    toast.classList.remove('visible');
  }, 3000);
}

function generateId() {
  return Date.now() + Math.random();
}

function getCurrentDate() {
  return new Date().toISOString().split('T')[0];
}

function getCurrentTime() {
  return new Date().toTimeString().split(' ')[0].substring(0, 5);
}

// Tab navigation
function initializeTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.dataset.tab;
      
      // Update active button
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Update visible panel
      tabPanels.forEach(panel => panel.classList.add('hidden'));
      document.getElementById(targetTab).classList.remove('hidden');
      
      // Refresh specific content
      if (targetTab === 'dashboard') {
        updateDashboard();
      } else if (targetTab === 'map-view') {
        initializeMap();
      }
    });
  });
  
  // Set default active tab
  tabButtons[0].classList.add('active');
}

// Trip Logger functionality
function initializeTripLogger() {
  const form = document.getElementById('trip-form');
  const purposeSelect = document.getElementById('purpose');
  const startTripBtn = document.getElementById('start-trip-btn');
  const exportBtn = document.getElementById('export-trips-btn');
  
  // Populate purpose dropdown
  appState.tripPurposes.forEach(purpose => {
    const option = document.createElement('option');
    option.value = purpose;
    option.textContent = purpose;
    purposeSelect.appendChild(option);
  });
  
  // Set default date and time
  document.getElementById('tripDate').value = getCurrentDate();
  document.getElementById('tripTime').value = getCurrentTime();
  
  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addTrip();
  });
  
  // GPS simulation
  startTripBtn.addEventListener('click', () => {
    simulateGPSTracking();
  });
  
  // Export functionality
  exportBtn.addEventListener('click', () => {
    exportTripsToCSV();
  });
  
  renderTripsList();
}

function simulateGPSTracking() {
  const startTripBtn = document.getElementById('start-trip-btn');
  
  if (!appState.isGPSTracking) {
    appState.isGPSTracking = true;
    startTripBtn.textContent = 'Stop GPS Tracking';
    startTripBtn.classList.remove('btn--primary');
    startTripBtn.classList.add('btn--error');
    
    // Simulate location detection
    setTimeout(() => {
      document.getElementById('startLocation').value = 'Current Location (GPS)';
      document.getElementById('distance').value = (Math.random() * 20 + 1).toFixed(1);
      showToast('GPS tracking started! Location detected.');
    }, 1000);
  } else {
    appState.isGPSTracking = false;
    startTripBtn.textContent = 'Start Trip (GPS)';
    startTripBtn.classList.remove('btn--error');
    startTripBtn.classList.add('btn--primary');
    
    document.getElementById('endLocation').value = 'Destination (GPS)';
    showToast('GPS tracking stopped! Trip data captured.');
  }
}

function addTrip() {
  const formData = new FormData(document.getElementById('trip-form'));
  
  const trip = {
    id: generateId(),
    startLocation: document.getElementById('startLocation').value,
    endLocation: document.getElementById('endLocation').value,
    distance: parseFloat(document.getElementById('distance').value),
    purpose: document.getElementById('purpose').value,
    date: document.getElementById('tripDate').value,
    time: document.getElementById('tripTime').value,
    notes: document.getElementById('notes').value,
    startCoords: [28.6139 + (Math.random() - 0.5) * 0.1, 77.2090 + (Math.random() - 0.5) * 0.1],
    endCoords: [28.5355 + (Math.random() - 0.5) * 0.1, 77.3910 + (Math.random() - 0.5) * 0.1]
  };
  
  appState.trips.push(trip);
  renderTripsList();
  updateHeaderSummary();
  showToast('Trip added successfully!');
  
  // Reset form
  document.getElementById('trip-form').reset();
  document.getElementById('tripDate').value = getCurrentDate();
  document.getElementById('tripTime').value = getCurrentTime();
}

function renderTripsList() {
  const list = document.getElementById('trips-list');
  list.innerHTML = '';
  
  appState.trips.slice().reverse().forEach(trip => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <strong>${trip.startLocation} → ${trip.endLocation}</strong><br>
        <small>${trip.distance}km • ${trip.purpose} • ${trip.date} ${trip.time}</small>
        ${trip.notes ? `<br><small>${trip.notes}</small>` : ''}
      </div>
      <div class="entry-actions">
        <button class="btn btn--sm btn--outline" onclick="editTrip(${trip.id})">Edit</button>
        <button class="btn btn--sm btn--outline" onclick="deleteTrip(${trip.id})">Delete</button>
      </div>
    `;
    list.appendChild(li);
  });
}

function editTrip(id) {
  const trip = appState.trips.find(t => t.id === id);
  if (!trip) return;
  
  appState.currentEditItem = { type: 'trip', data: trip };
  
  const modal = document.getElementById('edit-modal');
  const title = document.getElementById('edit-modal-title');
  const body = document.getElementById('edit-modal-body');
  
  title.textContent = 'Edit Trip';
  body.innerHTML = `
    <div class="form-group">
      <label class="form-label">Start Location</label>
      <input class="form-control" type="text" id="edit-startLocation" value="${trip.startLocation}" />
    </div>
    <div class="form-group">
      <label class="form-label">End Location</label>
      <input class="form-control" type="text" id="edit-endLocation" value="${trip.endLocation}" />
    </div>
    <div class="form-group">
      <label class="form-label">Distance (km)</label>
      <input class="form-control" type="number" step="0.1" id="edit-distance" value="${trip.distance}" />
    </div>
    <div class="form-group">
      <label class="form-label">Purpose</label>
      <select class="form-control" id="edit-purpose">
        ${appState.tripPurposes.map(p => `<option value="${p}" ${p === trip.purpose ? 'selected' : ''}>${p}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Notes</label>
      <textarea class="form-control" id="edit-notes">${trip.notes}</textarea>
    </div>
  `;
  
  modal.classList.remove('hidden');
}

function deleteTrip(id) {
  showConfirmModal('Are you sure you want to delete this trip?', () => {
    appState.trips = appState.trips.filter(t => t.id !== id);
    renderTripsList();
    updateHeaderSummary();
    showToast('Trip deleted successfully!');
  });
}

function exportTripsToCSV() {
  const headers = ['Start Location', 'End Location', 'Distance (km)', 'Purpose', 'Date', 'Time', 'Notes'];
  const rows = appState.trips.map(trip => [
    trip.startLocation, trip.endLocation, trip.distance, trip.purpose, trip.date, trip.time, trip.notes
  ]);
  
  const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'trips.csv';
  a.click();
  window.URL.revokeObjectURL(url);
  
  showToast('Trips exported to CSV!');
}

// Expense Tracker functionality
function initializeExpenseTracker() {
  const form = document.getElementById('expense-form');
  const categorySelect = document.getElementById('category');
  const receiptInput = document.getElementById('receipt');
  const ocrBtn = document.getElementById('ocr-btn');
  const exportBtn = document.getElementById('export-expenses-btn');
  
  // Populate category dropdown
  appState.categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
  
  // Set default date
  document.getElementById('expenseDate').value = getCurrentDate();
  
  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addExpense();
  });
  
  // Receipt file handling
  receiptInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const filenameSpan = document.getElementById('receipt-filename');
    if (file) {
      filenameSpan.textContent = `File: ${file.name}`;
      filenameSpan.classList.remove('hidden');
    } else {
      filenameSpan.classList.add('hidden');
    }
  });
  
  // OCR simulation
  ocrBtn.addEventListener('click', () => {
    simulateOCR();
  });
  
  // Export functionality
  exportBtn.addEventListener('click', () => {
    exportExpensesToCSV();
  });
  
  renderExpensesList();
}

function simulateOCR() {
  const mockData = appState.mockOCRData[Math.floor(Math.random() * appState.mockOCRData.length)];
  
  document.getElementById('description').value = `${mockData.merchant} - ${mockData.items.join(', ')}`;
  document.getElementById('amount').value = mockData.amount;
  document.getElementById('category').value = mockData.category;
  document.getElementById('expenseDate').value = mockData.date;
  
  showToast('OCR completed! Data extracted from receipt.');
}

function addExpense() {
  const receiptFile = document.getElementById('receipt').files[0];
  
  const expense = {
    id: generateId(),
    description: document.getElementById('description').value,
    amount: parseInt(document.getElementById('amount').value),
    category: document.getElementById('category').value,
    date: document.getElementById('expenseDate').value,
    receipt: receiptFile ? receiptFile.name : null,
    location: [28.6139 + (Math.random() - 0.5) * 0.1, 77.2090 + (Math.random() - 0.5) * 0.1]
  };
  
  appState.expenses.push(expense);
  renderExpensesList();
  updateHeaderSummary();
  showToast('Expense added successfully!');
  
  // Reset form
  document.getElementById('expense-form').reset();
  document.getElementById('expenseDate').value = getCurrentDate();
  document.getElementById('receipt-filename').classList.add('hidden');
}

function renderExpensesList() {
  const list = document.getElementById('expenses-list');
  list.innerHTML = '';
  
  appState.expenses.slice().reverse().forEach(expense => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <strong>${expense.description}</strong><br>
        <small>₹${expense.amount} • ${expense.category} • ${expense.date}</small>
        ${expense.receipt ? `<br><small>📎 ${expense.receipt}</small>` : ''}
      </div>
      <div class="entry-actions">
        <button class="btn btn--sm btn--outline" onclick="editExpense(${expense.id})">Edit</button>
        <button class="btn btn--sm btn--outline" onclick="deleteExpense(${expense.id})">Delete</button>
      </div>
    `;
    list.appendChild(li);
  });
}

function editExpense(id) {
  const expense = appState.expenses.find(e => e.id === id);
  if (!expense) return;
  
  appState.currentEditItem = { type: 'expense', data: expense };
  
  const modal = document.getElementById('edit-modal');
  const title = document.getElementById('edit-modal-title');
  const body = document.getElementById('edit-modal-body');
  
  title.textContent = 'Edit Expense';
  body.innerHTML = `
    <div class="form-group">
      <label class="form-label">Description</label>
      <input class="form-control" type="text" id="edit-description" value="${expense.description}" />
    </div>
    <div class="form-group">
      <label class="form-label">Amount (₹)</label>
      <input class="form-control" type="number" id="edit-amount" value="${expense.amount}" />
    </div>
    <div class="form-group">
      <label class="form-label">Category</label>
      <select class="form-control" id="edit-category">
        ${appState.categories.map(c => `<option value="${c}" ${c === expense.category ? 'selected' : ''}>${c}</option>`).join('')}
      </select>
    </div>
  `;
  
  modal.classList.remove('hidden');
}

function deleteExpense(id) {
  showConfirmModal('Are you sure you want to delete this expense?', () => {
    appState.expenses = appState.expenses.filter(e => e.id !== id);
    renderExpensesList();
    updateHeaderSummary();
    showToast('Expense deleted successfully!');
  });
}

function exportExpensesToCSV() {
  const headers = ['Description', 'Amount', 'Category', 'Date', 'Receipt'];
  const rows = appState.expenses.map(expense => [
    expense.description, expense.amount, expense.category, expense.date, expense.receipt || ''
  ]);
  
  const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'expenses.csv';
  a.click();
  window.URL.revokeObjectURL(url);
  
  showToast('Expenses exported to CSV!');
}

// Dashboard functionality
function updateDashboard() {
  updateDashboardCards();
  updateCharts();
}

function updateDashboardCards() {
  const currentDate = new Date();
  const weekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const tripsThisWeek = appState.trips.filter(trip => new Date(trip.date) >= weekAgo).length;
  const tripsThisMonth = appState.trips.filter(trip => new Date(trip.date) >= monthAgo).length;
  const totalDistance = appState.trips.reduce((sum, trip) => sum + trip.distance, 0);
  const totalExpenses = appState.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalBudget = Object.values(appState.budgetLimits).reduce((sum, limit) => sum + limit, 0);
  const budgetRemaining = totalBudget - totalExpenses;
  
  document.getElementById('dashboard-trips-week').textContent = tripsThisWeek;
  document.getElementById('dashboard-trips-month').textContent = tripsThisMonth;
  document.getElementById('dashboard-distance').textContent = totalDistance.toFixed(1);
  document.getElementById('dashboard-expenses').textContent = totalExpenses;
  document.getElementById('dashboard-budget-remaining').textContent = `₹${budgetRemaining}`;
  
  // Budget alert
  const budgetAlert = document.getElementById('budget-alert');
  if (budgetRemaining < totalBudget * 0.2) {
    budgetAlert.style.display = 'inline';
  } else {
    budgetAlert.style.display = 'none';
  }
}

function updateCharts() {
  updateCategoryPieChart();
  updateExpenseTrendChart();
  updateTripExpenseCorrelationChart();
}

function updateCategoryPieChart() {
  const ctx = document.getElementById('category-pie-chart');
  
  if (appState.charts.categoryPie) {
    appState.charts.categoryPie.destroy();
  }
  
  const categoryTotals = {};
  appState.categories.forEach(cat => categoryTotals[cat] = 0);
  appState.expenses.forEach(expense => {
    categoryTotals[expense.category] += expense.amount;
  });
  
  appState.charts.categoryPie = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: appState.categories,
      datasets: [{
        data: appState.categories.map(cat => categoryTotals[cat]),
        backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function updateExpenseTrendChart() {
  const ctx = document.getElementById('expense-trend-chart');
  
  if (appState.charts.expenseTrend) {
    appState.charts.expenseTrend.destroy();
  }
  
  // Group expenses by date
  const expensesByDate = {};
  appState.expenses.forEach(expense => {
    const date = expense.date;
    expensesByDate[date] = (expensesByDate[date] || 0) + expense.amount;
  });
  
  const dates = Object.keys(expensesByDate).sort();
  const amounts = dates.map(date => expensesByDate[date]);
  
  appState.charts.expenseTrend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Daily Expenses (₹)',
        data: amounts,
        borderColor: '#1FB8CD',
        backgroundColor: 'rgba(31, 184, 205, 0.1)',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function updateTripExpenseCorrelationChart() {
  const ctx = document.getElementById('trip-expense-corr-chart');
  
  if (appState.charts.tripExpenseCorr) {
    appState.charts.tripExpenseCorr.destroy();
  }
  
  // Group by date
  const dataByDate = {};
  appState.trips.forEach(trip => {
    const date = trip.date;
    if (!dataByDate[date]) dataByDate[date] = { trips: 0, expenses: 0 };
    dataByDate[date].trips += trip.distance;
  });
  
  appState.expenses.forEach(expense => {
    const date = expense.date;
    if (!dataByDate[date]) dataByDate[date] = { trips: 0, expenses: 0 };
    dataByDate[date].expenses += expense.amount;
  });
  
  const dates = Object.keys(dataByDate).sort();
  
  appState.charts.tripExpenseCorr = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'Trip Distance (km)',
          data: dates.map(date => dataByDate[date].trips),
          backgroundColor: '#FFC185',
          yAxisID: 'y'
        },
        {
          label: 'Expenses (₹)',
          data: dates.map(date => dataByDate[date].expenses),
          backgroundColor: '#1FB8CD',
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: {
            drawOnChartArea: false,
          },
        }
      }
    }
  });
}

// Map functionality
function initializeMap() {
  if (appState.map) return;
  
  appState.map = L.map('map').setView([28.6139, 77.2090], 12);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(appState.map);
  
  appState.tripLayer = L.layerGroup().addTo(appState.map);
  appState.expenseLayer = L.layerGroup().addTo(appState.map);
  
  updateMapData();
  
  // Layer toggle buttons
  document.getElementById('toggle-trips-layer').addEventListener('click', (e) => {
    const btn = e.target;
    if (btn.classList.contains('active')) {
      appState.map.removeLayer(appState.tripLayer);
      btn.classList.remove('active');
    } else {
      appState.map.addLayer(appState.tripLayer);
      btn.classList.add('active');
    }
  });
  
  document.getElementById('toggle-expenses-layer').addEventListener('click', (e) => {
    const btn = e.target;
    if (btn.classList.contains('active')) {
      appState.map.removeLayer(appState.expenseLayer);
      btn.classList.remove('active');
    } else {
      appState.map.addLayer(appState.expenseLayer);
      btn.classList.add('active');
    }
  });
}

function updateMapData() {
  if (!appState.map) return;
  
  // Clear existing layers
  appState.tripLayer.clearLayers();
  appState.expenseLayer.clearLayers();
  
  // Add trip markers and routes
  appState.trips.forEach(trip => {
    if (trip.startCoords && trip.endCoords) {
      // Start marker (green)
      L.marker(trip.startCoords, {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div style="background: #1FB8CD; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      }).bindPopup(`<b>Trip Start:</b> ${trip.startLocation}<br><b>Purpose:</b> ${trip.purpose}`).addTo(appState.tripLayer);
      
      // End marker (red)
      L.marker(trip.endCoords, {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div style="background: #B4413C; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      }).bindPopup(`<b>Trip End:</b> ${trip.endLocation}<br><b>Distance:</b> ${trip.distance}km`).addTo(appState.tripLayer);
      
      // Route line
      L.polyline([trip.startCoords, trip.endCoords], {
        color: '#1FB8CD',
        weight: 3,
        opacity: 0.7
      }).addTo(appState.tripLayer);
    }
  });
  
  // Add expense markers
  appState.expenses.forEach(expense => {
    if (expense.location) {
      L.marker(expense.location, {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div style="background: #FFC185; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      }).bindPopup(`<b>${expense.description}</b><br>₹${expense.amount} • ${expense.category}`).addTo(appState.expenseLayer);
    }
  });
}

// Modal functionality
function initializeModals() {
  const editModal = document.getElementById('edit-modal');
  const confirmModal = document.getElementById('confirm-modal');
  
  // Edit modal handlers
  document.getElementById('edit-modal-save').addEventListener('click', () => {
    saveEditedItem();
  });
  
  document.getElementById('edit-modal-cancel').addEventListener('click', () => {
    editModal.classList.add('hidden');
    appState.currentEditItem = null;
  });
  
  // Confirm modal handlers
  document.getElementById('confirm-modal-no').addEventListener('click', () => {
    confirmModal.classList.add('hidden');
  });
  
  // Close modal on backdrop click
  [editModal, confirmModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });
}

function saveEditedItem() {
  if (!appState.currentEditItem) return;
  
  const { type, data } = appState.currentEditItem;
  
  if (type === 'trip') {
    data.startLocation = document.getElementById('edit-startLocation').value;
    data.endLocation = document.getElementById('edit-endLocation').value;
    data.distance = parseFloat(document.getElementById('edit-distance').value);
    data.purpose = document.getElementById('edit-purpose').value;
    data.notes = document.getElementById('edit-notes').value;
    
    renderTripsList();
  } else if (type === 'expense') {
    data.description = document.getElementById('edit-description').value;
    data.amount = parseInt(document.getElementById('edit-amount').value);
    data.category = document.getElementById('edit-category').value;
    
    renderExpensesList();
  }
  
  updateHeaderSummary();
  document.getElementById('edit-modal').classList.add('hidden');
  appState.currentEditItem = null;
  showToast('Item updated successfully!');
}

function showConfirmModal(message, onConfirm) {
  const modal = document.getElementById('confirm-modal');
  const messageEl = document.getElementById('confirm-modal-message');
  const yesBtn = document.getElementById('confirm-modal-yes');
  
  messageEl.textContent = message;
  modal.classList.remove('hidden');
  
  // Remove existing listeners
  yesBtn.replaceWith(yesBtn.cloneNode(true));
  const newYesBtn = document.getElementById('confirm-modal-yes');
  
  newYesBtn.addEventListener('click', () => {
    onConfirm();
    modal.classList.add('hidden');
  });
}

// Header summary updates
function updateHeaderSummary() {
  const totalTrips = appState.trips.length;
  const totalExpenses = appState.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  document.getElementById('total-trip-count').textContent = totalTrips;
  document.getElementById('total-expense-amount').textContent = totalExpenses;
}

// Theme toggle
function initializeThemeToggle() {
  const themeBtn = document.getElementById('theme-toggle-btn');
  
  themeBtn.addEventListener('click', () => {
    const currentScheme = document.documentElement.getAttribute('data-color-scheme');
    const newScheme = currentScheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-color-scheme', newScheme);
    
    showToast(`Switched to ${newScheme} mode`);
  });
}

// Initialize app
function initializeApp() {
  initializeData();
  initializeTabs();
  initializeTripLogger();
  initializeExpenseTracker();
  initializeModals();
  initializeThemeToggle();
  updateHeaderSummary();
  updateDashboard();
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);