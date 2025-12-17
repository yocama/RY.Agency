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

// Handle conditional form fields based on quote type
const quoteTypeSelect = document.getElementById('quoteType');
if (quoteTypeSelect) {
    quoteTypeSelect.addEventListener('change', function() {
        // Hide all conditional fields
        document.querySelectorAll('.conditional-fields').forEach(field => {
            field.style.display = 'none';
            field.querySelectorAll('input').forEach(input => {
                input.required = false;
            });
        });

        // Show relevant fields based on selection
        const quoteType = this.value;
        if (quoteType === 'auto') {
            document.getElementById('autoFields').style.display = 'block';
            document.getElementById('vehicleInfo').required = true;
        } else if (quoteType === 'home') {
            document.getElementById('homeFields').style.display = 'block';
            document.getElementById('roofAge').required = true;
        } else if (quoteType === 'life') {
            document.getElementById('lifeFields').style.display = 'block';
            document.getElementById('coverageAmount').required = true;
        }
    });
}

// Quote form submission handler
const quoteForm = document.getElementById('quoteForm');
if (quoteForm) {
    quoteForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Collect all form data
        const formData = {
            quoteType: document.getElementById('quoteType').value,
            fullName: document.getElementById('fullName').value,
            address: document.getElementById('address').value,
            dob: document.getElementById('dob').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            vehicleInfo: document.getElementById('vehicleInfo').value || null,
            roofAge: document.getElementById('roofAge').value || null,
            coverageAmount: document.getElementById('coverageAmount').value || null,
            timestamp: new Date().toISOString()
        };

        // Validate required fields
        if (!formData.quoteType || !formData.fullName || !formData.address || !formData.dob || !formData.email || !formData.phone) {
            alert('Please fill in all required fields');
            return;
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
                // Hide conditional fields
                document.querySelectorAll('.conditional-fields').forEach(field => {
                    field.style.display = 'none';
                });
            } else {
                throw new Error('Failed to submit quote');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Fallback to email if CRM endpoint not configured
            const subject = encodeURIComponent('Quote Request from ' + formData.fullName);
            const body = encodeURIComponent(
                'Quote Type: ' + formData.quoteType + '\n' +
                'Name: ' + formData.fullName + '\n' +
                'Address: ' + formData.address + '\n' +
                'DOB: ' + formData.dob + '\n' +
                'Email: ' + formData.email + '\n' +
                'Phone: ' + formData.phone + '\n' +
                (formData.vehicleInfo ? 'Vehicle: ' + formData.vehicleInfo + '\n' : '') +
                (formData.roofAge ? 'Roof Age: ' + formData.roofAge + ' years\n' : '') +
                (formData.coverageAmount ? 'Coverage Amount: $' + formData.coverageAmount + '\n' : '')
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

