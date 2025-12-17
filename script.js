// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Google Places Autocomplete for address field
function initAddressAutocomplete() {
    const addressInput = document.getElementById('address');
    if (!addressInput) return;

    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps) {
        console.log('Google Maps API not loaded. Address autocomplete disabled.');
        return;
    }

    const autocomplete = new google.maps.places.Autocomplete(addressInput, {
        componentRestrictions: { country: 'us' },
        types: ['geocode']
    });

    autocomplete.addListener('place_changed', function() {
        const place = autocomplete.getPlace();
        if (!place.geometry) {
            console.log('Place details not available');
            return;
        }
        // Address is automatically filled by the autocomplete
    });
}

// Initialize autocomplete when DOM is ready
document.addEventListener('DOMContentLoaded', initAddressAutocomplete);

// Handle service card "Get Quote" links to auto-select insurance type
document.querySelectorAll('.service-link[data-insurance]').forEach(link => {
    link.addEventListener('click', function(e) {
        const insuranceType = this.dataset.insurance;
        // Auto-check the corresponding checkbox
        const checkbox = document.querySelector(`input[name="insuranceTypes"][value="${insuranceType}"]`);
        if (checkbox) {
            checkbox.checked = true;
            // Trigger change event to update conditional steps
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
});

// Quote form logic
let currentStep = 1;
const quoteForm = document.getElementById('quoteForm');
const formNav = document.getElementById('formNav');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const insuranceCheckboxes = document.querySelectorAll('input[name="insuranceTypes"]');
const addVehicleBtn = document.getElementById('addVehicleBtn');
let vehicleCount = 1;

// Handle insurance type selection changes
insuranceCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        updateConditionalSteps();
    });
});

// Update which conditional steps are shown based on selected insurance types
function updateConditionalSteps() {
    const selectedTypes = Array.from(insuranceCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    // Hide all conditional steps
    document.querySelectorAll('.conditional-step').forEach(step => {
        step.style.display = 'none';
    });

    // Show selected steps
    selectedTypes.forEach(type => {
        const stepId = type === 'auto' ? 'autoStep' :
                      type === 'home' ? 'homeStep' :
                      type === 'life' ? 'lifeStep' :
                      type === 'commercial' ? 'commercialStep' :
                      type === 'other' ? 'otherStep' : null;

        if (stepId) {
            document.getElementById(stepId).style.display = 'block';
        }
    });

    updateNavigation();
}

// Show specific step
function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(s => {
        s.style.display = 'none';
    });

    // Show current step
    document.getElementById('step' + step).style.display = 'block';
    currentStep = step;

    // Update navigation buttons
    updateNavigation();

    // Scroll to form
    quoteForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Update navigation buttons visibility
function updateNavigation() {
    const textingConsent = document.getElementById('textingConsent');

    if (currentStep === 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
        textingConsent.style.display = 'none';
    } else {
        prevBtn.style.display = 'block';
        submitBtn.style.display = 'block';
        nextBtn.style.display = 'none';
        textingConsent.style.display = 'block';
    }
}

// Next button handler
nextBtn.addEventListener('click', function() {
    if (validateCurrentStep()) {
        showStep(2);
    }
});

// Previous button handler
prevBtn.addEventListener('click', function() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
});

// Validate current step
function validateCurrentStep() {
    const step = document.getElementById('step' + currentStep);
    const inputs = step.querySelectorAll('input[required], select[required]');

    for (let input of inputs) {
        if (!input.value) {
            alert('Please fill in all required fields');
            input.focus();
            return false;
        }
    }

    // Check if at least one insurance type is selected
    const selectedTypes = Array.from(insuranceCheckboxes).some(cb => cb.checked);
    if (!selectedTypes) {
        alert('Please select at least one insurance type');
        return false;
    }

    return true;
}

// Add vehicle functionality
if (addVehicleBtn) {
    addVehicleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        vehicleCount++;
        const vehiclesList = document.getElementById('vehiclesList');
        const newVehicle = document.createElement('div');
        newVehicle.className = 'vehicle-group';
        newVehicle.dataset.vehicle = vehicleCount;
        newVehicle.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h5>Vehicle ${vehicleCount}</h5>
                <button type="button" class="remove-vehicle-btn" data-vehicle="${vehicleCount}">Remove</button>
            </div>
            <div class="form-group">
                <label for="vehicle${vehicleCount}Info">Vehicle (Year/Make/Model or VIN) *</label>
                <input type="text" id="vehicle${vehicleCount}Info" name="vehicle${vehicleCount}Info" placeholder="2020 Honda Civic or VIN">
            </div>
        `;
        vehiclesList.appendChild(newVehicle);

        // Add remove button listener
        newVehicle.querySelector('.remove-vehicle-btn').addEventListener('click', function(e) {
            e.preventDefault();
            newVehicle.remove();
        });
    });
}

// Quote form submission handler
if (quoteForm) {
    quoteForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get selected insurance types
        const selectedTypes = Array.from(insuranceCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        // Collect all form data
        const formData = {
            insuranceTypes: selectedTypes,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            dob: document.getElementById('dob').value,
            optOutTexts: document.getElementById('optOutTexts').checked,
            timestamp: new Date().toISOString()
        };

        // Add type-specific data
        if (selectedTypes.includes('auto')) {
            const vehicles = [];
            document.querySelectorAll('.vehicle-group').forEach((group, index) => {
                const vehicleNum = index + 1;
                const vehicleInfo = document.getElementById(`vehicle${vehicleNum}Info`).value;
                if (vehicleInfo) {
                    vehicles.push(vehicleInfo);
                }
            });
            formData.vehicles = vehicles;
        }

        if (selectedTypes.includes('home')) {
            formData.roofAge = document.getElementById('roofAge').value || null;
        }

        if (selectedTypes.includes('life')) {
            formData.genderAtBirth = document.getElementById('genderAtBirth').value || null;
            formData.tobacco = document.getElementById('tobacco').value || null;
            formData.coverageAmount = document.getElementById('coverageAmount').value || null;
        }

        if (selectedTypes.includes('commercial')) {
            formData.businessType = document.getElementById('businessType').value || null;
        }

        if (selectedTypes.includes('other')) {
            formData.otherCoverageType = document.getElementById('otherCoverageType').value || null;
        }

        // TODO: Replace with your actual CRM endpoint URL
        const CRM_ENDPOINT = 'https://your-crm-url.com/api/quotes'; // Update this with your CRM URL

        // Send to CRM
        fetch(CRM_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (response.ok) {
                alert('Thank you! Your quote request has been submitted. We\'ll contact you within 24 hours.');
                quoteForm.reset();
                currentStep = 1;
                showStep(1);
                vehicleCount = 1;
                document.getElementById('vehiclesList').innerHTML = `
                    <div class="vehicle-group" data-vehicle="1">
                        <h5>Vehicle 1</h5>
                        <div class="form-group">
                            <label for="vehicle1Info">Vehicle (Year/Make/Model or VIN) *</label>
                            <input type="text" id="vehicle1Info" name="vehicle1Info" placeholder="2020 Honda Civic or VIN">
                        </div>
                    </div>
                `;
            } else {
                throw new Error('Failed to submit quote');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Fallback to email if CRM endpoint not configured
            const subject = encodeURIComponent('Quote Request from ' + formData.firstName + ' ' + formData.lastName);
            const body = encodeURIComponent(
                'Insurance Types: ' + formData.insuranceTypes.join(', ') + '\n' +
                'Name: ' + formData.firstName + ' ' + formData.lastName + '\n' +
                'Email: ' + formData.email + '\n' +
                'Phone: ' + formData.phone + '\n' +
                'Address: ' + formData.address + '\n' +
                'DOB: ' + formData.dob + '\n' +
                'Opt Out of Texts: ' + (formData.optOutTexts ? 'Yes' : 'No') + '\n' +
                (formData.vehicles ? 'Vehicles: ' + formData.vehicles.join(', ') + '\n' : '') +
                (formData.roofAge ? 'Roof Age: ' + formData.roofAge + ' years\n' : '') +
                (formData.genderAtBirth ? 'Gender: ' + formData.genderAtBirth + '\n' : '') +
                (formData.tobacco ? 'Tobacco Use: ' + formData.tobacco + '\n' : '') +
                (formData.coverageAmount ? 'Coverage Amount: $' + formData.coverageAmount + '\n' : '') +
                (formData.businessType ? 'Business Type: ' + formData.businessType + '\n' : '') +
                (formData.otherCoverageType ? 'Other Coverage: ' + formData.otherCoverageType + '\n' : '')
            );
            window.location.href = 'mailto:Sales@ry.agency?subject=' + subject + '&body=' + body;
            alert('Quote submitted via email. We\'ll contact you within 24 hours.');
        });
    });
}

// Scroll animations for cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all animated elements
document.querySelectorAll('.service-card, .why-card, .testimonial-card, .feature').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
        navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    });
}

// Close mobile menu when link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function() {
        if (navLinks.style.display === 'flex') {
            navLinks.style.display = 'none';
        }
    });
});

