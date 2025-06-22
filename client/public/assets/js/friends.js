document.addEventListener('DOMContentLoaded', () => {
    if (!getAuthToken()) {
        window.location.href = 'auth.html';
        return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'auth.html';
        return;
    }

    document.getElementById('menuUsername').textContent = currentUser.username;
    document.getElementById('profileMenuUsername').textContent = currentUser.username;
    document.getElementById('menuProfilePic').textContent = currentUser.username.charAt(0).toUpperCase();
    document.getElementById('profilePicLarge').textContent = currentUser.username.charAt(0).toUpperCase();

    if (currentUser.avatar) {
        document.getElementById('menuProfilePic').style.backgroundImage = `url(${currentUser.avatar})`;
        document.getElementById('profilePicLarge').style.backgroundImage = `url(${currentUser.avatar})`;
    }

    document.getElementById('userInviteCode').textContent = currentUser.inviteCode;

    const copyInviteBtn = document.getElementById('copyInviteBtn');
    if (copyInviteBtn) {
        copyInviteBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(currentUser.inviteCode).then(() => {
                showToast('Invite code copied to clipboard');
            });
        });
    }

    const loadFriends = () => {
        apiRequest('/friends')
            .then(data => {
                const friendsList = document.getElementById('friendsList');
                friendsList.innerHTML = '';

                data.data.friends.forEach(friend => {
                    const friendItem = document.createElement('div');
                    friendItem.className = 'friend-item';
                    friendItem.innerHTML = `
                        <div class="profile-pic">${friend.username.charAt(0).toUpperCase()}</div>
                        <span>${friend.username}</span>
                        <div class="status-indicator status-${friend.status || 'offline'}"></div>
                        <button class="delete-friend-btn" data-id="${friend._id}" style="display: none;">Delete</button>
                    `;

                    if (friend.avatar) {
                        friendItem.querySelector('.profile-pic').style.backgroundImage = `url(${friend.avatar})`;
                    }

                    friendItem.addEventListener('click', () => {
                        window.location.href = `friend-chat.html?friend=${friend._id}`;
                    });

                    friendsList.appendChild(friendItem);
                });
            })
            .catch(err => {
                showToast(err.message);
            });
    };

    const loadFriendRequests = () => {
        apiRequest('/friends/requests')
            .then(data => {
                const requestList = document.getElementById('requestList');
                requestList.innerHTML = '';

                if (data.data.friendRequests.length === 0) {
                    requestList.innerHTML = '<p>No pending friend requests</p>';
                    return;
                }

                data.data.friendRequests.forEach(request => {
                    const requestItem = document.createElement('div');
                    requestItem.className = 'request-item';
                    requestItem.innerHTML = `
                        <div class="profile-pic">${request.sender.username.charAt(0).toUpperCase()}</div>
                        <span>${request.sender.username}</span>
                        <div class="request-actions">
                            <button class="accept-request-btn" data-id="${request._id}">Accept</button>
                            <button class="reject-request-btn" data-id="${request._id}">Reject</button>
                        </div>
                    `;

                    if (request.sender.avatar) {
                        requestItem.querySelector('.profile-pic').style.backgroundImage = `url(${request.sender.avatar})`;
                    }

                    requestList.appendChild(requestItem);
                });

                document.querySelectorAll('.accept-request-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const requestId = btn.getAttribute('data-id');
                        apiRequest(`/friends/requests/${requestId}`, 'PUT', { response: 'accepted' })
                            .then(() => {
                                loadFriends();
                                loadFriendRequests();
                                showToast('Friend request accepted');
                            })
                            .catch(err => {
                                showToast(err.message);
                            });
                    });
                });

                document.querySelectorAll('.reject-request-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const requestId = btn.getAttribute('data-id');
                        apiRequest(`/friends/requests/${requestId}`, 'PUT', { response: 'rejected' })
                            .then(() => {
                                loadFriendRequests();
                                showToast('Friend request rejected');
                            })
                            .catch(err => {
                                showToast(err.message);
                            });
                    });
                });
            })
            .catch(err => {
                showToast(err.message);
            });
    };

    const searchUsers = (query) => {
        apiRequest(`/users/search?query=${query}`)
            .then(data => {
                const searchResultsList = document.getElementById('searchResultsList');
                const searchResultsTitle = document.getElementById('searchResultsTitle');
                
                searchResultsList.innerHTML = '';
                searchResultsTitle.style.display = 'block';

                if (data.data.users.length === 0) {
                    searchResultsList.innerHTML = '<p>No users found</p>';
                    return;
                }

                data.data.users.forEach(user => {
                    const userItem = document.createElement('div');
                    userItem.className = 'friend-item';
                    userItem.innerHTML = `
                        <div class="profile-pic">${user.username.charAt(0).toUpperCase()}</div>
                        <span>${user.username}</span>
                        <button class="add-friend-btn" data-id="${user._id}">Add</button>
                    `;

                    if (user.avatar) {
                        userItem.querySelector('.profile-pic').style.backgroundImage = `url(${user.avatar})`;
                    }

                    searchResultsList.appendChild(userItem);
                });

                document.querySelectorAll('.add-friend-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const userId = btn.getAttribute('data-id');
                        apiRequest('/friends/request', 'POST', { recipientId: userId })
                            .then(() => {
                                showToast('Friend request sent');
                            })
                            .catch(err => {
                                showToast(err.message);
                            });
                    });
                });
            })
            .catch(err => {
                showToast(err.message);
            });
    };

    const searchFriends = (query) => {
        const friendsList = document.getElementById('friendsList');
        const friendItems = friendsList.querySelectorAll('.friend-item');
        
        friendItems.forEach(item => {
            const friendName = item.querySelector('span').textContent.toLowerCase();
            if (friendName.includes(query.toLowerCase())) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    };

    const manageBtn = document.getElementById('manageBtn');
    if (manageBtn) {
        manageBtn.addEventListener('click', () => {
            const deleteButtons = document.querySelectorAll('.delete-friend-btn');
            const isShowing = deleteButtons[0]?.style.display !== 'none';
            
            deleteButtons.forEach(btn => {
                btn.style.display = isShowing ? 'none' : 'block';
            });

            manageBtn.classList.toggle('active', !isShowing);
        });
    }

    document.querySelectorAll('.delete-friend-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const friendId = btn.getAttribute('data-id');
            apiRequest(`/friends/${friendId}`, 'DELETE')
                .then(() => {
                    loadFriends();
                    showToast('Friend removed');
                })
                .catch(err => {
                    showToast(err.message);
                });
        });
    });

    const searchUserBtn = document.getElementById('searchUserBtn');
    if (searchUserBtn) {
        searchUserBtn.addEventListener('click', () => {
            searchUserBtn.classList.toggle('active');
            document.getElementById('searchFriendsBtn').classList.remove('active');
            
            const searchInput = document.getElementById('searchInput');
            searchInput.placeholder = 'Search users...';
            searchInput.value = '';
            document.getElementById('searchResultsTitle').style.display = 'none';
            document.getElementById('searchResultsList').innerHTML = '';
        });
    }

    const searchFriendsBtn = document.getElementById('searchFriendsBtn');
    if (searchFriendsBtn) {
        searchFriendsBtn.addEventListener('click', () => {
            searchFriendsBtn.classList.toggle('active');
            document.getElementById('searchUserBtn').classList.remove('active');
            
            const searchInput = document.getElementById('searchInput');
            searchInput.placeholder = 'Search friends...';
            searchInput.value = '';
            document.getElementById('searchResultsTitle').style.display = 'none';
            document.getElementById('searchResultsList').innerHTML = '';
        });
    }

    const approvalBtn = document.getElementById('approvalBtn');
    if (approvalBtn) {
        approvalBtn.addEventListener('click', () => {
            document.getElementById('friendRequestModal').classList.add('modal-open');
            loadFriendRequests();
        });
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            const query = searchInput.value.trim();
            if (!query) {
                document.getElementById('searchResultsTitle').style.display = 'none';
                document.getElementById('searchResultsList').innerHTML = '';
                return;
            }

            if (searchUserBtn.classList.contains('active')) {
                searchUsers(query);
            } else if (searchFriendsBtn.classList.contains('active')) {
                searchFriends(query);
            }
        }, 300));
    }

    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            document.getElementById('editProfileModal').classList.add('modal-open');
            
            const user = getCurrentUser();
            document.getElementById('editUsername').value = user.username;
            document.getElementById('editBio').value = user.bio || '';
        });
    }

    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('editUsername').value;
            const bio = document.getElementById('editBio').value;
            
            apiRequest('/users/update', 'PUT', { username, bio })
                .then(data => {
                    setCurrentUser(data.data.user);
                    showToast('Profile updated');
                    document.getElementById('editProfileModal').classList.remove('modal-open');
                })
                .catch(err => {
                    showToast(err.message);
                });
        });
    }

    const uploadProfilePhotoBtn = document.getElementById('uploadProfilePhotoBtn');
    if (uploadProfilePhotoBtn) {
        uploadProfilePhotoBtn.addEventListener('click', () => {
            document.getElementById('profilePhotoInput').click();
        });
    }

    const profilePhotoInput = document.getElementById('profilePhotoInput');
    if (profilePhotoInput) {
        profilePhotoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64 = event.target.result;
                    apiRequest('/users/update', 'PUT', { avatar: base64 })
                        .then(data => {
                            setCurrentUser(data.data.user);
                            showToast('Profile photo updated');
                            
                            if (data.data.user.avatar) {
                                document.getElementById('menuProfilePic').style.backgroundImage = `url(${data.data.user.avatar})`;
                                document.getElementById('profilePicLarge').style.backgroundImage = `url(${data.data.user.avatar})`;
                            }
                        })
                        .catch(err => {
                            showToast(err.message);
                        });
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const logoutMenuItem = document.getElementById('logoutMenuItem');
    if (logoutMenuItem) {
        logoutMenuItem.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    loadFriends();
});