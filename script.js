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

// Handle service card "Get Quote" links to scroll to form
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.service-link[data-insurance]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const quoteForm = document.getElementById('quoteForm');
            if (quoteForm) {
                quoteForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});

// Quote form submission
document.addEventListener('DOMContentLoaded', function() {
    const quoteForm = document.getElementById('quoteForm');

    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form data
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const address = document.getElementById('address').value;
            const optOutTexts = document.getElementById('optOutTexts').checked;

            // Get selected insurance types
            const insuranceCheckboxes = document.querySelectorAll('input[name="insuranceTypes"]:checked');
            const insuranceTypes = Array.from(insuranceCheckboxes).map(cb => cb.value);

            if (insuranceTypes.length === 0) {
                alert('Please select at least one insurance type');
                return;
            }

            // Create email body
            const subject = encodeURIComponent('Quote Request from ' + firstName + ' ' + lastName);
            const body = encodeURIComponent(
                'Name: ' + firstName + ' ' + lastName + '\n' +
                'Email: ' + email + '\n' +
                'Phone: ' + phone + '\n' +
                'Address: ' + address + '\n' +
                'Insurance Types: ' + insuranceTypes.join(', ') + '\n' +
                'Opt Out of Texts: ' + (optOutTexts ? 'Yes' : 'No') + '\n\n' +
                'Submitted: ' + new Date().toLocaleString()
            );

            // Send email
            window.location.href = 'mailto:Sales@ry.agency?subject=' + subject + '&body=' + body;

            // Show confirmation
            alert('Thank you! Your quote request has been submitted. We\'ll contact you within 24 hours.');

            // Reset form
            quoteForm.reset();
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

