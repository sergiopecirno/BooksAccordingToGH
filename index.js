// Update ratings on main page from localStorage

function getBookVotes(bookId) {
    const stored = localStorage.getItem('bookclub_votes');
    const allVotes = stored ? JSON.parse(stored) : {};
    return allVotes[bookId] || [];
}

function calculateAverage(votes) {
    if (votes.length === 0) return null;
    const sum = votes.reduce((acc, vote) => acc + vote.rating, 0);
    return (sum / votes.length).toFixed(1);
}

function updateRatingDisplay(bookId, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const votes = getBookVotes(bookId);
    const average = calculateAverage(votes);
    
    if (average === null) {
        element.textContent = 'No votes yet';
    } else {
        element.textContent = `${average}/5 ⭐ (${votes.length} vote${votes.length !== 1 ? 's' : ''})`;
    }
}

// Update ratings on page load
document.addEventListener('DOMContentLoaded', () => {
    updateRatingDisplay('passion', 'passion-rating');
    updateRatingDisplay('flow-tears', 'flow-tears-rating');
});
