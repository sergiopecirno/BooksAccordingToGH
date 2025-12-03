// Reviews page JavaScript - display reviews from localStorage

const STORAGE_KEY = 'bookclub_votes';

// Get all votes from localStorage
function getAllVotes() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
}

// Get votes for a specific book
function getBookVotes(bookId) {
    const allVotes = getAllVotes();
    return allVotes[bookId] || [];
}

// Calculate average rating
function calculateAverage(votes) {
    if (votes.length === 0) return 0;
    const sum = votes.reduce((acc, vote) => acc + vote.rating, 0);
    return (sum / votes.length).toFixed(1);
}

// Display reviews for a book
function displayReviews(bookId, container, avgElement, countElement) {
    const votes = getBookVotes(bookId);
    
    // Update stats
    if (votes.length === 0) {
        avgElement.textContent = 'No votes yet';
        countElement.textContent = '0';
        container.innerHTML = '<div class="no-reviews">No reviews yet. Be the first to <a href="vote.html">vote and review</a> this book!</div>';
        return;
    }

    const average = calculateAverage(votes);
    avgElement.textContent = `${average}/5 ⭐`;
    countElement.textContent = votes.length;

    // Sort by timestamp (newest first)
    votes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Clear container
    container.innerHTML = '';

    // Create review items
    votes.forEach(vote => {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';

        const stars = '★'.repeat(vote.rating) + '☆'.repeat(5 - vote.rating);
        const date = new Date(vote.timestamp).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        reviewItem.innerHTML = `
            <div class="review-header">
                <span class="reviewer-name">${vote.name}</span>
                <div class="review-rating">
                    <span class="rating-number">${vote.rating}/5</span>
                    <span class="rating-stars">${stars}</span>
                </div>
            </div>
            ${vote.comment ? `<div class="review-comment">${vote.comment}</div>` : '<div class="review-comment" style="font-style: italic; color: #888;">No written review provided.</div>'}
            <div class="review-date">${date}</div>
        `;

        container.appendChild(reviewItem);
    });
}

// Initialize all review sections
function initializeReviewSections() {
    const reviewSections = document.querySelectorAll('.review-section');
    
    reviewSections.forEach(section => {
        const bookId = section.dataset.bookId;
        const container = section.querySelector('.reviews-container');
        const avgElement = section.querySelector('.avg-rating');
        const countElement = section.querySelector('.review-count');
        
        displayReviews(bookId, container, avgElement, countElement);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeReviewSections();
});
