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

    const loadUserGroups = () => {
        apiRequest('/groups')
            .then(data => {
                const groupListMenu = document.getElementById('groupListMenu');
                groupListMenu.innerHTML = '';

                data.data.groups.forEach(group => {
                    const groupItem = document.createElement('a');
                    groupItem.href = `group-chat.html?groupId=${group._id}`;
                    groupItem.className = 'menu-item';
                    groupItem.innerHTML = `
                        <i class="fas fa-hashtag"></i>
                        <span>${group.name}</span>
                    `;
                    groupListMenu.appendChild(groupItem);
                });
            })
            .catch(err => {
                showToast(err.message);
            });
    };

    const createGroupForm = document.getElementById('createGroupForm');
    if (createGroupForm) {
        createGroupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('groupName').value;
            const description = document.getElementById('groupDescription').value;
            const type = document.getElementById('groupType').value;
            
            apiRequest('/groups', 'POST', { name, description, type })
                .then(data => {
                    showToast('Group created');
                    document.getElementById('createGroupModal').classList.remove('modal-open');
                    loadUserGroups();
                    window.location.href = `group-chat.html?groupId=${data.data.group._id}`;
                })
                .catch(err => {
                    showToast(err.message);
                });
        });
    }

    const uploadGroupPhotoBtn = document.getElementById('uploadGroupPhotoBtn');
    if (uploadGroupPhotoBtn) {
        uploadGroupPhotoBtn.addEventListener('click', () => {
            document.getElementById('groupPhotoInput').click();
        });
    }

    const groupPhotoInput = document.getElementById('groupPhotoInput');
    if (groupPhotoInput) {
        groupPhotoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64 = event.target.result;
                    document.getElementById('uploadGroupPhotoBtn').innerHTML = `
                        <i class="fas fa-check"></i> Photo Selected
                    `;
                    
                    const groupId = new URLSearchParams(window.location.search).get('groupId');
                    if (groupId) {
                        apiRequest(`/groups/${groupId}`, 'PUT', { avatar: base64 })
                            .then(data => {
                                showToast('Group photo updated');
                            })
                            .catch(err => {
                                showToast(err.message);
                            });
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const joinGroupForm = document.getElementById('joinGroupForm');
    if (joinGroupForm) {
        joinGroupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const inviteCode = document.getElementById('groupInviteCode').value;
            
            apiRequest(`/groups/${inviteCode}/join`, 'POST')
                .then(data => {
                    showToast('Joined group');
                    document.getElementById('joinGroupModal').classList.remove('modal-open');
                    loadUserGroups();
                    window.location.href = `group-chat.html?groupId=${data.data.group._id}`;
                })
                .catch(err => {
                    showToast(err.message);
                });
        });
    }

    const createGroupBtn = document.getElementById('createGroupBtn');
    if (createGroupBtn) {
        createGroupBtn.addEventListener('click', () => {
            document.getElementById('createGroupModal').classList.add('modal-open');
        });
    }

    const addToGroupBtn = document.getElementById('addToGroupBtn');
    if (addToGroupBtn) {
        addToGroupBtn.addEventListener('click', () => {
            const friendId = new URLSearchParams(window.location.search).get('friend');
            if (!friendId) return;

            document.getElementById('groupSelectModal').classList.add('modal-open');
            
            apiRequest('/groups')
                .then(data => {
                    const existingGroupList = document.getElementById('existingGroupList');
                    existingGroupList.innerHTML = '';

                    data.data.groups.forEach(group => {
                        const groupItem = document.createElement('div');
                        groupItem.className = 'group-item';
                        groupItem.innerHTML = `
                            <h4>${group.name}</h4>
                            <p>${group.description || 'No description'}</p>
                            <button class="btn btn-small add-member-btn" data-group="${group._id}">Add</button>
                        `;

                        groupItem.querySelector('.add-member-btn').addEventListener('click', () => {
                            apiRequest(`/groups/${group._id}/members/${friendId}`, 'POST')
                                .then(() => {
                                    showToast('Friend added to group');
                                    document.getElementById('groupSelectModal').classList.remove('modal-open');
                                })
                                .catch(err => {
                                    showToast(err.message);
                                });
                        });

                        existingGroupList.appendChild(groupItem);
                    });
                })
                .catch(err => {
                    showToast(err.message);
                });
        });
    }

    const newGroupForm = document.getElementById('createGroupForm');
    if (newGroupForm) {
        newGroupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('newGroupName').value;
            const description = document.getElementById('newGroupDescription').value;
            const type = document.getElementById('newGroupType').value;
            const friendId = new URLSearchParams(window.location.search).get('friend');
            
            apiRequest('/groups', 'POST', { name, description, type, members: [friendId] })
                .then(data => {
                    showToast('Group created and friend added');
                    document.getElementById('groupSelectModal').classList.remove('modal-open');
                    loadUserGroups();
                    window.location.href = `group-chat.html?groupId=${data.data.group._id}`;
                })
                .catch(err => {
                    showToast(err.message);
                });
        });
    }

    loadUserGroups();
});