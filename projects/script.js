document.addEventListener('DOMContentLoaded', () => {
    // Expose initPortfolioGrid so firebase.js can re-trigger animations after loading dynamic data
    window.initPortfolioGrid = function() {
        const grid = document.getElementById('projectGrid');
        if (!grid) return;
        
        const cards = grid.querySelectorAll('.project-card');
        
        // Intersection Observer for high-end scroll reveal
        const observer = new IntersectionObserver((entries) => {
            const intersecting = entries.filter(e => e.isIntersecting);
            intersecting.forEach((entry, index) => {
                const card = entry.target;
                if (card.classList.contains('visible')) return;
                
                const delay = index * 0.08;
                card.style.transitionDelay = `${delay}s, ${delay}s, 0s`;
                
                requestAnimationFrame(() => {
                    card.classList.add('visible');
                });
                
                setTimeout(() => {
                    card.style.transitionDelay = '0s, 0s, 0s';
                }, (delay * 1000) + 800);
                
                observer.unobserve(card);
            });
        }, {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        });

        cards.forEach(card => observer.observe(card));
    };

    // Initialize original animations on hardcoded HTML
    window.initPortfolioGrid();
});
