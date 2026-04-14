// Desktop keeps the looping marquee, mobile switches to swipeable cards.
document.addEventListener('DOMContentLoaded', function() {
    const track = document.getElementById('testimonialsTrack');
    const scrollContainer = document.querySelector('.testimonials-scroll-container');
    if (!track || !scrollContainer) return;

    const mobileTestimonialsQuery = window.matchMedia('(max-width: 768px)');
    function cloneTestimonialCard(card) {
        const clone = card.cloneNode(true);
        clone.style.removeProperty('opacity');
        clone.style.removeProperty('transform');
        clone.style.removeProperty('transition');
        return clone;
    }

    const originalCards = Array.from(track.querySelectorAll('.testimonial-card')).map(cloneTestimonialCard);

    function renderTestimonials(cards) {
        track.replaceChildren(...cards.map(cloneTestimonialCard));
    }

    function setTestimonialsMode(isMobile) {
        renderTestimonials(originalCards);
        scrollContainer.scrollLeft = 0;

        if (isMobile) {
            track.dataset.mode = 'swipe';
            return;
        }

        const desktopCards = Array.from(track.querySelectorAll('.testimonial-card'));
        desktopCards.forEach(card => {
            const clone = cloneTestimonialCard(card);
            clone.dataset.clone = 'true';
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        });
        track.dataset.mode = 'marquee';
    }

    function handleTestimonialsModeChange(event) {
        setTestimonialsMode(event.matches);
    }

    setTestimonialsMode(mobileTestimonialsQuery.matches);

    if (typeof mobileTestimonialsQuery.addEventListener === 'function') {
        mobileTestimonialsQuery.addEventListener('change', handleTestimonialsModeChange);
    } else {
        mobileTestimonialsQuery.addListener(handleTestimonialsModeChange);
    }
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
    if (!addressInput) {
        // If address field doesn't exist yet, try again when form becomes visible
        return;
    }

    const autocomplete = new google.maps.places.Autocomplete(addressInput, {
        componentRestrictions: { country: 'us' },
        types: ['address'],
        fields: ['formatted_address', 'address_components']
    });

    autocomplete.addListener('place_changed', function() {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
            addressInput.value = place.formatted_address;
        }
    });
}

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
    const leadEmailRecipient = 'ryocom@farmersagent.com';
    const formSubmitEndpoint = 'https://formsubmit.co/ryocom@farmersagent.com';

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

    function collectVehicles() {
        const vehicles = [];

        for (let i = 1; i <= vehicleCount; i++) {
            const year = document.querySelector(`input[name="vehicleYear${i}"]`)?.value.trim() || '';
            const make = document.querySelector(`input[name="vehicleMake${i}"]`)?.value.trim() || '';
            const model = document.querySelector(`input[name="vehicleModel${i}"]`)?.value.trim() || '';
            const vin = document.querySelector(`input[name="vehicleVin${i}"]`)?.value.trim() || '';

            if (year || make || model || vin) {
                vehicles.push({
                    index: i,
                    year,
                    make,
                    model,
                    vin
                });
            }
        }

        return vehicles;
    }

    function collectDrivers() {
        const drivers = [];

        for (let i = 1; i <= driverCount; i++) {
            const name = document.querySelector(`input[name="driverName${i}"]`)?.value.trim() || '';
            const driverDob = document.querySelector(`input[name="driverDob${i}"]`)?.value || '';

            if (name) {
                drivers.push({
                    index: i,
                    name,
                    dob: driverDob
                });
            }
        }

        return drivers;
    }

    function collectLeadData() {
        const selectedInsuranceTypes = Array.from(selectedTypes);

        return {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            address: document.getElementById('address').value.trim(),
            dob: document.getElementById('dob').value,
            selectedTypes: selectedInsuranceTypes,
            optOutTexts: document.getElementById('optOutTexts').checked,
            additionalDetails: document.getElementById('additionalDetails').value.trim(),
            submittedAt: new Date().toISOString(),
            pageUrl: window.location.href,
            vehicles: selectedTypes.has('auto') ? collectVehicles() : [],
            additionalDrivers: selectedTypes.has('auto') ? collectDrivers() : [],
            roofAge: selectedTypes.has('home') ? (document.getElementById('roofAge')?.value || '') : '',
            coverageAmount: selectedTypes.has('life') ? (document.getElementById('coverageAmount')?.value || '') : '',
            tobaccoUse: selectedTypes.has('life') ? (document.querySelector('input[name="tobaccoUse"]:checked')?.value || '') : '',
            genderAtBirth: selectedTypes.has('life') ? (document.querySelector('input[name="genderAtBirth"]:checked')?.value || '') : '',
            businessType: selectedTypes.has('commercial') ? (document.getElementById('businessType')?.value.trim() || '') : '',
            numEmployees: selectedTypes.has('commercial') ? (document.getElementById('numEmployees')?.value || '') : '',
            petType: selectedTypes.has('pet') ? (document.getElementById('petType')?.value || '') : '',
            petAge: selectedTypes.has('pet') ? (document.getElementById('petAge')?.value || '') : '',
            petBreed: selectedTypes.has('pet') ? (document.getElementById('petBreed')?.value.trim() || '') : '',
            otherCoverageType: selectedTypes.has('other') ? (document.getElementById('otherCoverageType')?.value.trim() || '') : ''
        };
    }

    function buildLeadBodyParts(leadData) {
        const bodyParts = [
            'QUOTE REQUEST',
            '=============',
            '',
            'CONTACT INFORMATION:',
            'Name: ' + leadData.firstName + ' ' + leadData.lastName,
            'Email: ' + leadData.email,
            'Phone: ' + leadData.phone,
            'Address: ' + leadData.address,
            'Date of Birth: ' + leadData.dob,
            '',
            'Insurance Types: ' + leadData.selectedTypes.join(', ').toUpperCase()
        ];

        if (leadData.selectedTypes.includes('auto')) {
            bodyParts.push('', 'AUTO INSURANCE DETAILS:');

            leadData.vehicles.forEach(vehicle => {
                if (vehicle.vin) {
                    bodyParts.push(`Vehicle ${vehicle.index}: VIN - ${vehicle.vin}`);
                } else {
                    bodyParts.push(`Vehicle ${vehicle.index}: ${vehicle.year} ${vehicle.make} ${vehicle.model}`.trim());
                }
            });

            leadData.additionalDrivers.forEach(driver => {
                bodyParts.push(`Additional Driver ${driver.index}: ${driver.name} (DOB: ${driver.dob})`);
            });
        }

        if (leadData.selectedTypes.includes('home')) {
            bodyParts.push('', 'HOME INSURANCE DETAILS:');
            bodyParts.push('Roof Age: ' + leadData.roofAge + ' years');
        }

        if (leadData.selectedTypes.includes('life')) {
            bodyParts.push('', 'LIFE INSURANCE DETAILS:');
            bodyParts.push('Coverage Amount: $' + leadData.coverageAmount);
            bodyParts.push('Tobacco Use: ' + leadData.tobaccoUse);
            bodyParts.push('Gender at Birth: ' + leadData.genderAtBirth);
        }

        if (leadData.selectedTypes.includes('commercial')) {
            bodyParts.push('', 'BUSINESS INSURANCE DETAILS:');
            bodyParts.push('Business Type: ' + leadData.businessType);
            bodyParts.push('Number of Employees: ' + leadData.numEmployees);
        }

        if (leadData.selectedTypes.includes('pet')) {
            bodyParts.push('', 'PET INSURANCE DETAILS:');
            bodyParts.push('Pet Type: ' + leadData.petType);
            bodyParts.push('Pet Age: ' + leadData.petAge);
            bodyParts.push('Breed: ' + leadData.petBreed);
        }

        if (leadData.selectedTypes.includes('other')) {
            bodyParts.push('', 'OTHER COVERAGE DETAILS:');
            bodyParts.push('Coverage Type: ' + leadData.otherCoverageType);
        }

        if (leadData.additionalDetails) {
            bodyParts.push('', 'ADDITIONAL DETAILS:');
            bodyParts.push(leadData.additionalDetails);
        }

        bodyParts.push('', 'Opt Out of Texts: ' + (leadData.optOutTexts ? 'Yes' : 'No'));
        bodyParts.push('', 'Submitted: ' + leadData.submittedAt);

        return bodyParts;
    }

    function buildFormSubmitPayload(leadData) {
        const fullName = (leadData.firstName + ' ' + leadData.lastName).trim();
        const formattedMessage = buildLeadBodyParts(leadData).join('\n');

        return {
            _subject: 'Quote Request from ' + fullName + ' - ' + leadData.selectedTypes.join(', ').toUpperCase(),
            _replyto: leadData.email,
            _template: 'basic',
            _url: leadData.pageUrl,
            _captcha: 'false',
            _honey: '',
            name: fullName,
            email: leadData.email,
            phone: leadData.phone,
            message: formattedMessage
        };
    }

    function submitLeadToFormSubmit(leadData) {
        const iframeName = 'formsubmit-hidden-frame';
        let iframe = document.querySelector(`iframe[name="${iframeName}"]`);

        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.name = iframeName;
            iframe.title = 'Hidden lead submission frame';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
        }

        const payload = buildFormSubmitPayload(leadData);
        const hiddenForm = document.createElement('form');
        hiddenForm.method = 'POST';
        hiddenForm.action = formSubmitEndpoint;
        hiddenForm.target = iframeName;
        hiddenForm.style.display = 'none';

        Object.entries(payload).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            hiddenForm.appendChild(input);
        });

        document.body.appendChild(hiddenForm);
        hiddenForm.submit();

        window.setTimeout(() => {
            hiddenForm.remove();
        }, 1000);
    }

    function resetDynamicFormSections() {
        const vehiclesList = document.getElementById('vehiclesList');
        const driversList = document.getElementById('driversList');
        const firstVehicleYmmButton = document.querySelector('.toggle-btn[data-vehicle="1"][data-input="ymm"]');
        const firstVehicleVinButton = document.querySelector('.toggle-btn[data-vehicle="1"][data-input="vin"]');
        const firstVehicleYmmInputs = document.querySelector('.ymm-inputs[data-vehicle="1"]');
        const firstVehicleVinInput = document.querySelector('.vin-input[data-vehicle="1"]');

        vehiclesList?.querySelectorAll('.vehicle-entry').forEach((entry, index) => {
            if (index > 0) {
                entry.remove();
            }
        });

        driversList?.querySelectorAll('.driver-entry').forEach((entry, index) => {
            if (index > 0) {
                entry.remove();
            }
        });

        if (firstVehicleYmmButton && firstVehicleVinButton && firstVehicleYmmInputs && firstVehicleVinInput) {
            firstVehicleYmmButton.classList.add('active');
            firstVehicleVinButton.classList.remove('active');
            firstVehicleYmmInputs.style.display = 'block';
            firstVehicleVinInput.style.display = 'none';
        }

        vehicleCount = 1;
        driverCount = 1;
    }

    // Form submission
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();

            if (!quoteForm.reportValidity()) {
                return;
            }

            if (selectedTypes.size === 0) {
                alert('Please select at least one insurance type');
                return;
            }

            const leadData = collectLeadData();
            const submitButton = quoteForm.querySelector('.submit-button');
            const originalButtonText = submitButton ? submitButton.textContent : '';

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Sending...';
            }

            try {
                submitLeadToFormSubmit(leadData);
            } catch (error) {
                console.error('Lead submission failed:', error);
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                }
                alert('We could not submit your quote automatically. Please call 918-600-2022 or email ' + leadEmailRecipient + '.');
                return;
            }

            alert('Thank you! Your quote request has been submitted. We\'ll contact you within 24 hours.');

            quoteForm.reset();
            selectedTypes.clear();
            typeCards.forEach(card => card.classList.remove('active'));
            updateFormVisibility();
            resetDynamicFormSections();

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
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

// Observe all animated elements except testimonials, which are re-rendered for marquee/swipe behavior.
document.querySelectorAll('.service-card, .why-card, .feature').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navbar = document.querySelector('.navbar');
const mobileNavBreakpoint = 768;

function setMobileMenuState(isOpen) {
    if (!mobileMenuToggle || !navbar) {
        return;
    }

    navbar.classList.toggle('menu-open', isOpen);
    mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
    mobileMenuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
}

if (mobileMenuToggle && navLinks && navbar) {
    mobileMenuToggle.addEventListener('click', function() {
        setMobileMenuState(!navbar.classList.contains('menu-open'));
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= mobileNavBreakpoint) {
                setMobileMenuState(false);
            }
        });
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth > mobileNavBreakpoint) {
            setMobileMenuState(false);
        }
    });

    document.addEventListener('click', function(event) {
        if (window.innerWidth > mobileNavBreakpoint || !navbar.classList.contains('menu-open')) {
            return;
        }

        if (!navbar.contains(event.target)) {
            setMobileMenuState(false);
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            setMobileMenuState(false);
        }
    });
}
