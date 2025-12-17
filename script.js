// Testimonials auto-scroll - duplicate cards for seamless loop
document.addEventListener('DOMContentLoaded', function() {
    const track = document.getElementById('testimonialsTrack');
    if (!track) return;

    const cards = Array.from(track.querySelectorAll('.testimonial-card'));

    // Duplicate all cards to create seamless loop
    cards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });
});

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

// Handle service card "Get Quote" links to scroll to form and select type
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.service-link[data-insurance]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const insuranceType = this.getAttribute('data-insurance');
            const quoteFormContainer = document.getElementById('quoteFormContainer');
            if (quoteFormContainer) {
                quoteFormContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Auto-select the insurance type
                setTimeout(() => {
                    const typeCard = document.querySelector(`.quote-type-card[data-type="${insuranceType}"]`);
                    if (typeCard && !typeCard.classList.contains('active')) {
                        typeCard.click();
                    }
                }, 500);
            }
        });
    });
});

// Quote Form Interactivity
document.addEventListener('DOMContentLoaded', function() {
    const quoteForm = document.getElementById('quoteForm');
    const quoteFormWrapper = document.getElementById('quoteFormWrapper');
    const typeCards = document.querySelectorAll('.quote-type-card');
    const baseInfoSection = document.getElementById('baseInfoSection');
    const additionalSection = document.getElementById('additionalSection');

    // Track selected types
    let selectedTypes = new Set();
    let vehicleCount = 1;
    let driverCount = 1;

    // Handle insurance type card clicks
    typeCards.forEach(card => {
        card.addEventListener('click', function() {
            const type = this.getAttribute('data-type');

            // Toggle active state
            this.classList.toggle('active');

            if (this.classList.contains('active')) {
                selectedTypes.add(type);
            } else {
                selectedTypes.delete(type);
            }

            // Show/hide form sections based on selection
            updateFormVisibility();
        });
    });

    function updateFormVisibility() {
        if (selectedTypes.size > 0) {
            // Show form wrapper and base info
            quoteFormWrapper.style.display = 'block';
            baseInfoSection.style.display = 'block';
            additionalSection.style.display = 'block';

            // Show/hide type-specific sections
            document.getElementById('autoSection').style.display = selectedTypes.has('auto') ? 'block' : 'none';
            document.getElementById('homeSection').style.display = selectedTypes.has('home') ? 'block' : 'none';
            document.getElementById('lifeSection').style.display = selectedTypes.has('life') ? 'block' : 'none';
            document.getElementById('commercialSection').style.display = selectedTypes.has('commercial') ? 'block' : 'none';
            document.getElementById('petSection').style.display = selectedTypes.has('pet') ? 'block' : 'none';
            document.getElementById('otherSection').style.display = selectedTypes.has('other') ? 'block' : 'none';
        } else {
            // Hide form wrapper
            quoteFormWrapper.style.display = 'none';
            baseInfoSection.style.display = 'none';
            additionalSection.style.display = 'none';
            document.querySelectorAll('.type-section').forEach(section => {
                section.style.display = 'none';
            });
        }
    }

    // Handle YMM/VIN toggle buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('toggle-btn')) {
            const vehicleNum = e.target.getAttribute('data-vehicle');
            const inputType = e.target.getAttribute('data-input');

            // Update active state for toggle buttons
            document.querySelectorAll(`.toggle-btn[data-vehicle="${vehicleNum}"]`).forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');

            // Show/hide appropriate input fields
            const ymmInputs = document.querySelector(`.ymm-inputs[data-vehicle="${vehicleNum}"]`);
            const vinInput = document.querySelector(`.vin-input[data-vehicle="${vehicleNum}"]`);

            if (inputType === 'ymm') {
                ymmInputs.style.display = 'block';
                vinInput.style.display = 'none';
            } else {
                ymmInputs.style.display = 'none';
                vinInput.style.display = 'block';
            }
        }
    });

    // Add Vehicle button
    const addVehicleBtn = document.getElementById('addVehicleBtn');
    if (addVehicleBtn) {
        addVehicleBtn.addEventListener('click', function() {
            vehicleCount++;
            const vehiclesList = document.getElementById('vehiclesList');
            const newVehicle = document.createElement('div');
            newVehicle.className = 'vehicle-entry';
            newVehicle.setAttribute('data-vehicle', vehicleCount);
            newVehicle.innerHTML = `
                <p class="entry-label">Vehicle ${vehicleCount}</p>
                <div class="form-group">
                    <label>Enter vehicle info by:</label>
                    <div class="toggle-group">
                        <button type="button" class="toggle-btn active" data-input="ymm" data-vehicle="${vehicleCount}">Year/Make/Model</button>
                        <button type="button" class="toggle-btn" data-input="vin" data-vehicle="${vehicleCount}">VIN</button>
                    </div>
                </div>
                <div class="ymm-inputs" data-vehicle="${vehicleCount}">
                    <div class="form-row three-col">
                        <div class="form-group">
                            <label>Year</label>
                            <input type="text" name="vehicleYear${vehicleCount}" placeholder="2024">
                        </div>
                        <div class="form-group">
                            <label>Make</label>
                            <input type="text" name="vehicleMake${vehicleCount}" placeholder="Toyota">
                        </div>
                        <div class="form-group">
                            <label>Model</label>
                            <input type="text" name="vehicleModel${vehicleCount}" placeholder="Camry">
                        </div>
                    </div>
                </div>
                <div class="vin-input" data-vehicle="${vehicleCount}" style="display: none;">
                    <div class="form-group">
                        <label>VIN</label>
                        <input type="text" name="vehicleVin${vehicleCount}" placeholder="17-character VIN" maxlength="17">
                    </div>
                </div>
            `;
            vehiclesList.appendChild(newVehicle);
        });
    }

    // Add Driver button
    const addDriverBtn = document.getElementById('addDriverBtn');
    if (addDriverBtn) {
        addDriverBtn.addEventListener('click', function() {
            driverCount++;
            const driversList = document.getElementById('driversList');
            const newDriver = document.createElement('div');
            newDriver.className = 'driver-entry';
            newDriver.setAttribute('data-driver', driverCount);
            newDriver.innerHTML = `
                <p class="entry-label">Additional Driver ${driverCount}</p>
                <div class="form-row">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" name="driverName${driverCount}" placeholder="Driver name">
                    </div>
                    <div class="form-group">
                        <label>Date of Birth</label>
                        <input type="date" name="driverDob${driverCount}">
                    </div>
                </div>
            `;
            driversList.appendChild(newDriver);
        });
    }

    // Form submission
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();

            if (selectedTypes.size === 0) {
                alert('Please select at least one insurance type');
                return;
            }

            // Get form data
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const address = document.getElementById('address').value;
            const dob = document.getElementById('dob').value;
            const optOutTexts = document.getElementById('optOutTexts').checked;
            const additionalDetails = document.getElementById('additionalDetails').value;

            // Build email body
            let bodyParts = [
                'QUOTE REQUEST',
                '=============',
                '',
                'CONTACT INFORMATION:',
                'Name: ' + firstName + ' ' + lastName,
                'Email: ' + email,
                'Phone: ' + phone,
                'Address: ' + address,
                'Date of Birth: ' + dob,
                '',
                'Insurance Types: ' + Array.from(selectedTypes).join(', ').toUpperCase()
            ];

            // Add type-specific details
            if (selectedTypes.has('auto')) {
                bodyParts.push('', 'AUTO INSURANCE DETAILS:');
                for (let i = 1; i <= vehicleCount; i++) {
                    const year = document.querySelector(`input[name="vehicleYear${i}"]`)?.value || '';
                    const make = document.querySelector(`input[name="vehicleMake${i}"]`)?.value || '';
                    const model = document.querySelector(`input[name="vehicleModel${i}"]`)?.value || '';
                    const vin = document.querySelector(`input[name="vehicleVin${i}"]`)?.value || '';
                    if (year || make || model || vin) {
                        if (vin) {
                            bodyParts.push(`Vehicle ${i}: VIN - ${vin}`);
                        } else {
                            bodyParts.push(`Vehicle ${i}: ${year} ${make} ${model}`);
                        }
                    }
                }
                for (let i = 1; i <= driverCount; i++) {
                    const name = document.querySelector(`input[name="driverName${i}"]`)?.value || '';
                    const driverDob = document.querySelector(`input[name="driverDob${i}"]`)?.value || '';
                    if (name) {
                        bodyParts.push(`Additional Driver ${i}: ${name} (DOB: ${driverDob})`);
                    }
                }
            }

            if (selectedTypes.has('home')) {
                const roofAge = document.getElementById('roofAge')?.value || '';
                bodyParts.push('', 'HOME INSURANCE DETAILS:');
                bodyParts.push('Roof Age: ' + roofAge + ' years');
            }

            if (selectedTypes.has('life')) {
                const coverage = document.getElementById('coverageAmount')?.value || '';
                const tobacco = document.querySelector('input[name="tobaccoUse"]:checked')?.value || '';
                const gender = document.querySelector('input[name="genderAtBirth"]:checked')?.value || '';
                bodyParts.push('', 'LIFE INSURANCE DETAILS:');
                bodyParts.push('Coverage Amount: $' + coverage);
                bodyParts.push('Tobacco Use: ' + tobacco);
                bodyParts.push('Gender at Birth: ' + gender);
            }

            if (selectedTypes.has('commercial')) {
                const businessType = document.getElementById('businessType')?.value || '';
                const numEmployees = document.getElementById('numEmployees')?.value || '';
                bodyParts.push('', 'BUSINESS INSURANCE DETAILS:');
                bodyParts.push('Business Type: ' + businessType);
                bodyParts.push('Number of Employees: ' + numEmployees);
            }

            if (selectedTypes.has('pet')) {
                const petType = document.getElementById('petType')?.value || '';
                const petAge = document.getElementById('petAge')?.value || '';
                const petBreed = document.getElementById('petBreed')?.value || '';
                bodyParts.push('', 'PET INSURANCE DETAILS:');
                bodyParts.push('Pet Type: ' + petType);
                bodyParts.push('Pet Age: ' + petAge);
                bodyParts.push('Breed: ' + petBreed);
            }

            if (selectedTypes.has('other')) {
                const otherType = document.getElementById('otherCoverageType')?.value || '';
                bodyParts.push('', 'OTHER COVERAGE DETAILS:');
                bodyParts.push('Coverage Type: ' + otherType);
            }

            if (additionalDetails) {
                bodyParts.push('', 'ADDITIONAL DETAILS:');
                bodyParts.push(additionalDetails);
            }

            bodyParts.push('', 'Opt Out of Texts: ' + (optOutTexts ? 'Yes' : 'No'));
            bodyParts.push('', 'Submitted: ' + new Date().toLocaleString());

            const subject = encodeURIComponent('Quote Request from ' + firstName + ' ' + lastName + ' - ' + Array.from(selectedTypes).join(', ').toUpperCase());
            const body = encodeURIComponent(bodyParts.join('\n'));

            // Send email
            window.location.href = 'mailto:Sales@ry.agency?subject=' + subject + '&body=' + body;

            // Show confirmation
            alert('Thank you! Your quote request has been submitted. We\'ll contact you within 24 hours.');

            // Reset form
            quoteForm.reset();
            selectedTypes.clear();
            typeCards.forEach(card => card.classList.remove('active'));
            updateFormVisibility();
            vehicleCount = 1;
            driverCount = 1;
        });
    }
});

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

