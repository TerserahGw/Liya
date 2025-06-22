document.addEventListener('DOMContentLoaded', () => {
    const currentUser = getCurrentUser();
    if (!currentUser && window.location.pathname !== '/auth.html') {
        window.location.href = 'auth.html';
        return;
    }

    const menuBtn = document.getElementById('menuBtn');
    const closeMenuBtn = document.getElementById('closeMenu');
    const profileBtn = document.getElementById('profileBtn');
    const closeProfileMenuBtn = document.getElementById('closeProfileMenu');
    
    if (menuBtn) menuBtn.addEventListener('click', () => {
        document.getElementById('sideMenu').classList.add('slide-in-left');
    });
    
    if (closeMenuBtn) closeMenuBtn.addEventListener('click', () => {
        document.getElementById('sideMenu').classList.remove('slide-in-left');
    });
    
    if (profileBtn) profileBtn.addEventListener('click', () => {
        document.getElementById('profileMenu').classList.add('slide-in-right');
    });
    
    if (closeProfileMenuBtn) closeProfileMenuBtn.addEventListener('click', () => {
        document.getElementById('profileMenu').classList.remove('slide-in-right');
    });
    
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.history.back();
        });
    }
    
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('modal-open');
            });
        }
    });
    
    const friendsCard = document.getElementById('friendsCard');
    if (friendsCard) {
        friendsCard.addEventListener('click', () => {
            window.location.href = 'friend-list.html';
        });
    }
    
    const groupsCard = document.getElementById('groupsCard');
    if (groupsCard) {
        groupsCard.addEventListener('click', () => {
            document.getElementById('createGroupModal').classList.add('modal-open');
        });
    }
    
    const inviteCard = document.getElementById('inviteCard');
    if (inviteCard) {
        inviteCard.addEventListener('click', () => {
            document.getElementById('inviteModal').classList.add('modal-open');
        });
    }
    
    const copyInviteCodeBtn = document.getElementById('copyInviteCodeBtn');
    if (copyInviteCodeBtn) {
        copyInviteCodeBtn.addEventListener('click', () => {
            const inviteCode = document.getElementById('inviteCodeDisplay').textContent;
            navigator.clipboard.writeText(inviteCode).then(() => {
                showToast('Invite code copied!');
            });
        });
    }
    
    const tabContainers = document.querySelectorAll('.tab-container');
    tabContainers.forEach(container => {
        const tabs = container.querySelectorAll('.tab-btn');
        const tabContents = container.parentElement.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                const tabId = tab.getAttribute('data-tab');
                const content = container.parentElement.querySelector(`#${tabId}Tab`);
                if (content) content.classList.add('active');
            });
        });
    });
    
    const banDurationSelect = document.getElementById('banDuration');
    if (banDurationSelect) {
        banDurationSelect.addEventListener('change', (e) => {
            const customDateGroup = document.getElementById('customDateGroup');
            customDateGroup.style.display = e.target.value === 'custom' ? 'block' : 'none';
        });
    }
    
    const friendsMenuItem = document.getElementById('friendsMenuItem');
    if (friendsMenuItem) {
        friendsMenuItem.addEventListener('click', () => {
            const friendListMenu = document.getElementById('friendListMenu');
            friendListMenu.style.display = friendListMenu.style.display === 'none' ? 'block' : 'none';
        });
    }
    
    const groupsMenuItem = document.getElementById('groupsMenuItem');
    if (groupsMenuItem) {
        groupsMenuItem.addEventListener('click', () => {
            const groupListMenu = document.getElementById('groupListMenu');
            groupListMenu.style.display = groupListMenu.style.display === 'none' ? 'block' : 'none';
        });
    }
    
    const logoutMenuItem = document.getElementById('logoutMenuItem');
    if (logoutMenuItem) {
        logoutMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.side-menu') && !e.target.closest('#menuBtn')) {
            document.getElementById('sideMenu').classList.remove('slide-in-left');
        }
        
        if (!e.target.closest('.profile-menu') && !e.target.closest('#profileBtn')) {
            document.getElementById('profileMenu').classList.remove('slide-in-right');
        }
        
        if (!e.target.closest('.right-sidebar') && !e.target.closest('#friendProfileBtn') && !e.target.closest('#groupMoreBtn')) {
            document.getElementById('rightSidebar').classList.remove('slide-in-right');
        }
    });
});