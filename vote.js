// Vote management system using localStorage

// Storage keys
const STORAGE_KEY = 'bookclub_votes';

// Get all votes from localStorage
function getAllVotes() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
}

// Save votes to localStorage
function saveVotes(votes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
}

// Get votes for a specific book
function getBookVotes(bookId) {
    const allVotes = getAllVotes();
    return allVotes[bookId] || [];
}

// Add a vote for a book
function addVote(bookId, voterName, rating, comment) {
    const allVotes = getAllVotes();
    if (!allVotes[bookId]) {
        allVotes[bookId] = [];
    }
    
    // Check if user already voted
    const existingVoteIndex = allVotes[bookId].findIndex(v => v.name.toLowerCase() === voterName.toLowerCase());
    
    const vote = {
        name: voterName,
        rating: rating,
        comment: comment,
        timestamp: new Date().toISOString()
    };
    
    if (existingVoteIndex >= 0) {
        // Update existing vote
        allVotes[bookId][existingVoteIndex] = vote;
    } else {
        // Add new vote
        allVotes[bookId].push(vote);
    }
    
    saveVotes(allVotes);
    return existingVoteIndex >= 0;
}

// Calculate average rating
function calculateAverage(votes) {
    if (votes.length === 0) return 0;
    const sum = votes.reduce((acc, vote) => acc + vote.rating, 0);
    return (sum / votes.length).toFixed(1);
}

// Display votes for a book
function displayVotes(bookId, container) {
    const votes = getBookVotes(bookId);
    container.innerHTML = '';
    
    if (votes.length === 0) {
        container.innerHTML = '<div class="no-votes">No votes yet. Be the first to rate this book!</div>';
        return;
    }
    
    // Sort by timestamp (newest first)
    votes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    votes.forEach(vote => {
        const voteItem = document.createElement('div');
        voteItem.className = 'vote-item';
        
        const stars = '★'.repeat(vote.rating) + '☆'.repeat(5 - vote.rating);
        const date = new Date(vote.timestamp).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        voteItem.innerHTML = `
            <div class="vote-header">
                <span class="voter-name-display">${vote.name}</span>
                <span class="vote-rating">${vote.rating}/5 ${stars}</span>
            </div>
            ${vote.comment ? `<div class="vote-comment">${vote.comment}</div>` : ''}
            <div class="vote-timestamp">${date}</div>
        `;
        
        container.appendChild(voteItem);
    });
}

// Update rating display
function updateRatingDisplay(bookId, avgElement, countElement) {
    const votes = getBookVotes(bookId);
    const average = calculateAverage(votes);
    
    if (votes.length === 0) {
        avgElement.textContent = 'No votes yet';
    } else {
        avgElement.textContent = `${average}/5 ⭐`;
    }
    
    countElement.textContent = `${votes.length} vote${votes.length !== 1 ? 's' : ''}`;
}

// Initialize voting interface for a section
function initializeVoteSection(section) {
    const bookId = section.dataset.bookId;
    const stars = section.querySelectorAll('.star');
    const submitBtn = section.querySelector('.submit-vote');
    const voterNameInput = section.querySelector('.voter-name');
    const voterCommentInput = section.querySelector('.voter-comment');
    const messageEl = section.querySelector('.vote-message');
    const avgElement = section.querySelector('.avg-rating');
    const countElement = section.querySelector('.vote-count');
    const votesContainer = section.querySelector('.votes-container');
    
    let selectedRating = 0;
    
    // Star hover and click effects
    stars.forEach((star, index) => {
        star.addEventListener('mouseenter', () => {
            stars.forEach((s, i) => {
                s.classList.toggle('active', i <= index);
            });
        });
        
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.rating);
            stars.forEach((s, i) => {
                s.classList.toggle('selected', i < selectedRating);
            });
            updateSubmitButton();
        });
    });
    
    section.querySelector('.star-rating').addEventListener('mouseleave', () => {
        stars.forEach(s => s.classList.remove('active'));
    });
    
    // Enable submit button when requirements met
    function updateSubmitButton() {
        const hasRating = selectedRating > 0;
        submitBtn.disabled = !hasRating;
    }
    
    // Submit vote
    submitBtn.addEventListener('click', () => {
        const voterName = voterNameInput.value.trim() || 'Anonymous';
        const comment = voterCommentInput.value.trim();
        
        if (selectedRating === 0) {
            showMessage(messageEl, 'Please select a rating.', 'error');
            return;
        }
        
        const wasUpdate = addVote(bookId, voterName, selectedRating, comment);
        
        // Reset form
        voterNameInput.value = '';
        voterCommentInput.value = '';
        selectedRating = 0;
        stars.forEach(s => s.classList.remove('selected'));
        submitBtn.disabled = true;
        
        // Show success message
        const message = wasUpdate 
            ? 'Your vote has been updated!' 
            : 'Thank you for voting!';
        showMessage(messageEl, message, 'success');
        
        // Update displays
        updateRatingDisplay(bookId, avgElement, countElement);
        displayVotes(bookId, votesContainer);
        
        // Scroll to votes
        setTimeout(() => {
            votesContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 500);
    });
    
    // Initialize displays
    updateRatingDisplay(bookId, avgElement, countElement);
    displayVotes(bookId, votesContainer);
}

// Show message
function showMessage(element, text, type) {
    element.textContent = text;
    element.className = `vote-message ${type}`;
    
    setTimeout(() => {
        element.style.display = 'none';
        element.className = 'vote-message';
    }, 5000);
}

// Initialize all vote sections on page load
document.addEventListener('DOMContentLoaded', () => {
    const voteSections = document.querySelectorAll('.vote-section');
    voteSections.forEach(section => {
        initializeVoteSection(section);
    });
});

// Export data function (for admin use - accessible via console)
window.exportVotes = function() {
    const votes = getAllVotes();
    console.log('All votes:', votes);
    
    // Create downloadable JSON
    const dataStr = JSON.stringify(votes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'bookclub_votes_' + new Date().toISOString().split('T')[0] + '.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
};

// Clear all votes function (for admin use - accessible via console)
window.clearAllVotes = function() {
    if (confirm('Are you sure you want to clear all votes? This cannot be undone!')) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    }
};
