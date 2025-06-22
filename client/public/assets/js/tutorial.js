document.addEventListener('DOMContentLoaded', () => {
    const showTutorial = localStorage.getItem('showTutorial') === 'true';
    if (!showTutorial) return;
    
    const tutorialOverlay = document.getElementById('tutorialOverlay');
    const skipTutorialBtn = document.getElementById('skipTutorialBtn');
    const nextTutorialBtn = document.getElementById('nextTutorialBtn');
    const tutorialText = document.getElementById('tutorialText');
    
    if (!tutorialOverlay || !skipTutorialBtn || !nextTutorialBtn) return;
    
    let currentStep = 0;
    const tutorialSteps = getTutorialSteps();
    
    tutorialOverlay.style.display = 'flex';
    
    function getTutorialSteps() {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        
        if (path === 'friends.html') {
            return [
                "Welcome to Chioriya Chat! This is your friends list.",
                "Tap on a friend to start chatting with them",
                "Use the search bar to find friends or users",
                "Tap the menu button to see your groups and settings"
            ];
        } else if (path === 'friend-chat.html') {
            return [
                "This is your chat screen. Type messages at the bottom",
                "Tap on your friend's name to see their profile",
                "Swipe from left to right to open the side menu"
            ];
        } else if (path === 'group-chat.html') {
            return [
                "This is a group chat. You can chat with multiple people here",
                "Tap the group name to see group members and rooms",
                "Swipe from left to right to see group settings"
            ];
        } else {
            return ["Welcome to Chioriya Chat!"];
        }
    }
    
    function updateTutorialStep() {
        if (currentStep < tutorialSteps.length) {
            tutorialText.textContent = tutorialSteps[currentStep];
            
            if (currentStep === tutorialSteps.length - 1) {
                nextTutorialBtn.textContent = 'Got it!';
            } else {
                nextTutorialBtn.textContent = 'Next';
            }
            
            highlightRelevantElement();
        } else {
            finishTutorial();
        }
    }
    
    function highlightRelevantElement() {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        
        if (path === 'friends.html') {
            if (currentStep === 1) {
                const firstFriend = document.querySelector('.friend-item');
                if (firstFriend) firstFriend.classList.add('tutorial-highlight');
            } else if (currentStep === 2) {
                document.querySelector('.search-box').classList.add('tutorial-highlight');
            } else if (currentStep === 3) {
                document.getElementById('menuBtn').classList.add('tutorial-highlight');
            }
        } else if (path === 'friend-chat.html') {
            if (currentStep === 0) {
                document.getElementById('messageInput').classList.add('tutorial-highlight');
            } else if (currentStep === 1) {
                document.getElementById('friendProfileBtn').classList.add('tutorial-highlight');
            } else if (currentStep === 2) {
                document.getElementById('menuBtn').classList.add('tutorial-highlight');
            }
        } else if (path === 'group-chat.html') {
            if (currentStep === 1) {
                document.getElementById('groupMoreBtn').classList.add('tutorial-highlight');
            } else if (currentStep === 2) {
                document.getElementById('menuBtn').classList.add('tutorial-highlight');
            }
        }
    }
    
    function removeHighlights() {
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });
    }
    
    function finishTutorial() {
        localStorage.setItem('showTutorial', 'false');
        tutorialOverlay.style.display = 'none';
        removeHighlights();
    }
    
    skipTutorialBtn.addEventListener('click', finishTutorial);
    
    nextTutorialBtn.addEventListener('click', () => {
        removeHighlights();
        currentStep++;
        updateTutorialStep();
    });
    
    updateTutorialStep();
});