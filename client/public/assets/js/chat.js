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

    const messageInput = document.getElementById('messageInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const messagesContainer = document.getElementById('messagesContainer');

    let socket;
    let chatId;
    let isGroupChat = false;

    const setupWebSocket = () => {
        if (socket) {
            socket.close();
        }

        socket = new WebSocket(`ws://${window.location.host}/ws?token=${getAuthToken()}`);

        socket.onopen = () => {
            console.log('WebSocket connected');
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'message') {
                appendMessage(message.data);
            } else if (message.type === 'status') {
                updateUserStatus(message.data);
            }
        };

        socket.onclose = () => {
            console.log('WebSocket disconnected');
        };
    };

    const loadFriendChat = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const friendId = urlParams.get('friend');
        
        if (!friendId) {
            window.location.href = 'friend-list.html';
            return;
        }

        isGroupChat = false;
        chatId = `private_${[currentUser._id, friendId].sort().join('_')}`;

        apiRequest(`/users/${friendId}`)
            .then(data => {
                const friend = data.data.user;
                document.getElementById('friendName').textContent = friend.username;
                document.getElementById('friendSidebarName').textContent = friend.username;
                document.getElementById('friendSidebarUsername').textContent = `@${friend.username}`;
                
                const profilePic = document.querySelector('.chat-info .profile-pic');
                profilePic.textContent = friend.username.charAt(0).toUpperCase();
                
                const sidebarPic = document.getElementById('friendSidebarPic');
                sidebarPic.textContent = friend.username.charAt(0).toUpperCase();
                
                if (friend.avatar) {
                    profilePic.style.backgroundImage = `url(${friend.avatar})`;
                    sidebarPic.style.backgroundImage = `url(${friend.avatar})`;
                }

                document.getElementById('friendStatus').textContent = friend.status || 'offline';
                document.getElementById('friendSidebarStatus').textContent = friend.status || 'offline';
                
                loadMessages();
                setupWebSocket();
            })
            .catch(err => {
                showToast(err.message);
                window.location.href = 'friend-list.html';
            });
    };

    const loadGroupChat = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const groupId = urlParams.get('groupId');
        
        if (!groupId) {
            window.location.href = 'friends.html';
            return;
        }

        isGroupChat = true;
        chatId = `group_${groupId}`;

        apiRequest(`/groups/${groupId}`)
            .then(data => {
                const group = data.data.group;
                document.getElementById('groupNameHeader').textContent = group.name;
                document.getElementById('groupSidebarName').textContent = group.name;
                
                const groupPic = document.getElementById('groupSidebarPic');
                groupPic.textContent = group.name.charAt(0).toUpperCase();
                
                if (group.avatar) {
                    groupPic.style.backgroundImage = `url(${group.avatar})`;
                }

                const roomList = document.getElementById('roomList');
                roomList.innerHTML = '';

                group.rooms.forEach(room => {
                    const roomItem = document.createElement('div');
                    roomItem.className = 'room-item';
                    roomItem.innerHTML = `
                        <i class="fas fa-hashtag"></i>
                        <span>${room.name}</span>
                    `;
                    roomList.appendChild(roomItem);
                });

                const memberList = document.getElementById('memberList');
                memberList.innerHTML = '';

                group.members.forEach(member => {
                    const memberItem = document.createElement('div');
                    memberItem.className = 'member-item';
                    memberItem.innerHTML = `
                        <div class="profile-pic">${member.user.username.charAt(0).toUpperCase()}</div>
                        <span>${member.user.username}</span>
                        <div class="member-role" style="background-color: ${group.roles.find(r => r.name === member.role)?.color || '#4caf50'}">
                            ${member.role}
                        </div>
                    `;

                    if (member.user.avatar) {
                        memberItem.querySelector('.profile-pic').style.backgroundImage = `url(${member.user.avatar})`;
                    }

                    memberList.appendChild(memberItem);
                });

                loadMessages();
                setupWebSocket();
            })
            .catch(err => {
                showToast(err.message);
                window.location.href = 'friends.html';
            });
    };

    const loadMessages = () => {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (isGroupChat) {
            const groupId = urlParams.get('groupId');
            apiRequest(`/messages/group/${groupId}`)
                .then(data => {
                    displayMessages(data.data.messages);
                })
                .catch(err => {
                    showToast(err.message);
                });
        } else {
            const friendId = urlParams.get('friend');
            apiRequest(`/messages/private/${friendId}`)
                .then(data => {
                    displayMessages(data.data.messages);
                })
                .catch(err => {
                    showToast(err.message);
                });
        }
    };

    const displayMessages = (messages) => {
        messagesContainer.innerHTML = '';
        
        if (messages.length === 0) {
            const welcomeMsg = document.createElement('div');
            welcomeMsg.className = 'welcome-message';
            welcomeMsg.innerHTML = `
                <h3>${isGroupChat ? 'Welcome to the group!' : 'Start chatting'}</h3>
                <p>${isGroupChat ? 'Send your first message to the group' : 'Send your first message'}</p>
            `;
            messagesContainer.appendChild(welcomeMsg);
            return;
        }

        messages.forEach(msg => {
            appendMessage(msg);
        });

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    const appendMessage = (msg) => {
        const isCurrentUser = msg.sender._id === currentUser._id;
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isCurrentUser ? 'self' : ''} message-appear`;
        
        messageElement.innerHTML = `
            <div class="profile-pic">${msg.sender.username.charAt(0).toUpperCase()}</div>
            <div class="message-content">
                ${!isCurrentUser ? `<div class="message-sender">${msg.sender.username}</div>` : ''}
                <div class="message-text">${msg.content}</div>
                <div class="message-time">${formatDate(msg.timestamp)}</div>
            </div>
        `;
        
        if (msg.sender.avatar) {
            messageElement.querySelector('.profile-pic').style.backgroundImage = `url(${msg.sender.avatar})`;
        }
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    const sendMessage = () => {
        const messageText = messageInput.value.trim();
        if (!messageText) return;
        
        const urlParams = new URLSearchParams(window.location.search);
        
        if (isGroupChat) {
            const groupId = urlParams.get('groupId');
            apiRequest('/messages', 'POST', {
                content: messageText,
                type: 'text',
                chatType: 'group',
                recipient: groupId
            })
                .then(data => {
                    messageInput.value = '';
                    appendMessage(data.data.message);
                    
                    if (socket && socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({
                            type: 'message',
                            data: data.data.message,
                            chatId: chatId
                        }));
                    }
                })
                .catch(err => {
                    showToast(err.message);
                });
        } else {
            const friendId = urlParams.get('friend');
            apiRequest('/messages', 'POST', {
                content: messageText,
                type: 'text',
                chatType: 'private',
                recipient: friendId
            })
                .then(data => {
                    messageInput.value = '';
                    appendMessage(data.data.message);
                    
                    if (socket && socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({
                            type: 'message',
                            data: data.data.message,
                            chatId: chatId
                        }));
                    }
                })
                .catch(err => {
                    showToast(err.message);
                });
        }
    };

    const updateUserStatus = (data) => {
        if (data.userId === new URLSearchParams(window.location.search).get('friend')) {
            document.getElementById('friendStatus').textContent = data.status;
            document.getElementById('friendSidebarStatus').textContent = data.status;
        }
    };

    if (sendMessageBtn && messageInput) {
        sendMessageBtn.addEventListener('click', sendMessage);
        
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    const friendProfileBtn = document.getElementById('friendProfileBtn');
    if (friendProfileBtn) {
        friendProfileBtn.addEventListener('click', () => {
            document.getElementById('rightSidebar').classList.add('slide-in-right');
        });
    }

    const closeRightSidebar = document.getElementById('closeRightSidebar');
    if (closeRightSidebar) {
        closeRightSidebar.addEventListener('click', () => {
            document.getElementById('rightSidebar').classList.remove('slide-in-right');
        });
    }

    const clearChatBtn = document.getElementById('clearChatBtn');
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const friendId = urlParams.get('friend');
            
            if (!friendId) return;
            
            apiRequest(`/messages/private/${friendId}`, 'DELETE')
                .then(() => {
                    loadMessages();
                    showToast('Chat history cleared');
                })
                .catch(err => {
                    showToast(err.message);
                });
        });
    }

    const removeFriendBtn = document.getElementById('removeFriendBtn');
    if (removeFriendBtn) {
        removeFriendBtn.addEventListener('click', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const friendId = urlParams.get('friend');
            
            if (!friendId) return;
            
            apiRequest(`/friends/${friendId}`, 'DELETE')
                .then(() => {
                    showToast('Friend removed');
                    setTimeout(() => {
                        window.location.href = 'friend-list.html';
                    }, 1000);
                })
                .catch(err => {
                    showToast(err.message);
                });
        });
    }

    const groupMoreBtn = document.getElementById('groupMoreBtn');
    if (groupMoreBtn) {
        groupMoreBtn.addEventListener('click', () => {
            document.getElementById('rightSidebar').classList.add('slide-in-right');
        });
    }

    const roomsMenuItem = document.getElementById('roomsMenuItem');
    if (roomsMenuItem) {
        roomsMenuItem.addEventListener('click', () => {
            const roomList = document.getElementById('roomList');
            roomList.style.display = roomList.style.display === 'none' ? 'block' : 'none';
        });
    }

    const membersMenuItem = document.getElementById('membersMenuItem');
    if (membersMenuItem) {
        membersMenuItem.addEventListener('click', () => {
            const memberList = document.getElementById('memberList');
            memberList.style.display = memberList.style.display === 'none' ? 'block' : 'none';
        });
    }

    const groupSettingsBtn = document.getElementById('groupSettingsBtn');
    if (groupSettingsBtn) {
        groupSettingsBtn.addEventListener('click', () => {
            document.getElementById('groupSettingsModal').classList.add('modal-open');
            
            const urlParams = new URLSearchParams(window.location.search);
            const groupId = urlParams.get('groupId');
            
            apiRequest(`/groups/${groupId}`)
                .then(data => {
                    const group = data.data.group;
                    document.getElementById('groupNameSetting').value = group.name;
                    document.getElementById('groupDescSetting').value = group.description || '';
                    document.getElementById('groupTypeSetting').value = group.type;
                    
                    const rolesList = document.getElementById('rolesList');
                    rolesList.innerHTML = '';
                    
                    group.roles.forEach(role => {
                        const roleItem = document.createElement('div');
                        roleItem.className = 'role-item';
                        roleItem.innerHTML = `
                            <div class="role-color" style="background-color: ${role.color}"></div>
                            <span>${role.name}</span>
                            <button class="btn btn-small edit-role-btn" data-id="${role._id}">Edit</button>
                            ${role.name !== 'creator' && role.name !== 'admin' && role.name !== 'member' ? 
                              `<button class="btn btn-small btn-danger delete-role-btn" data-id="${role._id}">Delete</button>` : ''}
                        `;
                        rolesList.appendChild(roleItem);
                    });
                    
                    const roomsList = document.getElementById('roomsList');
                    roomsList.innerHTML = '';
                    
                    group.rooms.forEach(room => {
                        const roomItem = document.createElement('div');
                        roomItem.className = 'room-list-item';
                        roomItem.innerHTML = `
                            <i class="fas fa-hashtag"></i>
                            <span>${room.name}</span>
                            <button class="btn btn-small edit-room-btn" data-id="${room._id}">Edit</button>
                            <button class="btn btn-small btn-danger delete-room-btn" data-id="${room._id}">Delete</button>
                        `;
                        roomsList.appendChild(roomItem);
                    });
                })
                .catch(err => {
                    showToast(err.message);
                });
        });
    }

    const addRoleBtn = document.getElementById('addRoleBtn');
    if (addRoleBtn) {
        addRoleBtn.addEventListener('click', () => {
            document.getElementById('roleModal').classList.add('modal-open');
            document.getElementById('roleForm').reset();
            document.getElementById('roleForm').setAttribute('data-action', 'create');
        });
    }

    const roleForm = document.getElementById('roleForm');
    if (roleForm) {
        roleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('roleName').value;
            const color = document.getElementById('roleColor').value;
            const rank = document.getElementById('roleRank').value;
            const action = roleForm.getAttribute('data-action');
            const roleId = roleForm.getAttribute('data-id');
            
            const urlParams = new URLSearchParams(window.location.search);
            const groupId = urlParams.get('groupId');
            
            if (action === 'create') {
                apiRequest(`/groups/${groupId}/roles`, 'POST', { name, color, rank })
                    .then(() => {
                        showToast('Role created');
                        document.getElementById('roleModal').classList.remove('modal-open');
                        
                        apiRequest(`/groups/${groupId}`)
                            .then(data => {
                                const rolesList = document.getElementById('rolesList');
                                rolesList.innerHTML = '';
                                
                                data.data.group.roles.forEach(role => {
                                    const roleItem = document.createElement('div');
                                    roleItem.className = 'role-item';
                                    roleItem.innerHTML = `
                                        <div class="role-color" style="background-color: ${role.color}"></div>
                                        <span>${role.name}</span>
                                        <button class="btn btn-small edit-role-btn" data-id="${role._id}">Edit</button>
                                        ${role.name !== 'creator' && role.name !== 'admin' && role.name !== 'member' ? 
                                          `<button class="btn btn-small btn-danger delete-role-btn" data-id="${role._id}">Delete</button>` : ''}
                                    `;
                                    rolesList.appendChild(roleItem);
                                });
                            })
                            .catch(err => {
                                showToast(err.message);
                            });
                    })
                    .catch(err => {
                        showToast(err.message);
                    });
            } else {
                apiRequest(`/groups/${groupId}/roles/${roleId}`, 'PUT', { name, color, rank })
                    .then(() => {
                        showToast('Role updated');
                        document.getElementById('roleModal').classList.remove('modal-open');
                        
                        apiRequest(`/groups/${groupId}`)
                            .then(data => {
                                const rolesList = document.getElementById('rolesList');
                                rolesList.innerHTML = '';
                                
                                data.data.group.roles.forEach(role => {
                                    const roleItem = document.createElement('div');
                                    roleItem.className = 'role-item';
                                    roleItem.innerHTML = `
                                        <div class="role-color" style="background-color: ${role.color}"></div>
                                        <span>${role.name}</span>
                                        <button class="btn btn-small edit-role-btn" data-id="${role._id}">Edit</button>
                                        ${role.name !== 'creator' && role.name !== 'admin' && role.name !== 'member' ? 
                                          `<button class="btn btn-small btn-danger delete-role-btn" data-id="${role._id}">Delete</button>` : ''}
                                    `;
                                    rolesList.appendChild(roleItem);
                                });
                            })
                            .catch(err => {
                                showToast(err.message);
                            });
                    })
                    .catch(err => {
                        showToast(err.message);
                    });
            }
        });
    }

    const addRoomBtn = document.getElementById('addRoomBtn');
    if (addRoomBtn) {
        addRoomBtn.addEventListener('click', () => {
            document.getElementById('roomModal').classList.add('modal-open');
            document.getElementById('roomForm').reset();
            document.getElementById('roomForm').setAttribute('data-action', 'create');
        });
    }

    const roomForm = document.getElementById('roomForm');
    if (roomForm) {
        roomForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('roomName').value;
            const description = document.getElementById('roomDescription').value;
            const type = document.getElementById('roomType').value;
            const action = roomForm.getAttribute('data-action');
            const roomId = roomForm.getAttribute('data-id');
            
            const urlParams = new URLSearchParams(window.location.search);
            const groupId = urlParams.get('groupId');
            
            if (action === 'create') {
                apiRequest(`/groups/${groupId}/rooms`, 'POST', { name, description, type })
                    .then(() => {
                        showToast('Room created');
                        document.getElementById('roomModal').classList.remove('modal-open');
                        
                        apiRequest(`/groups/${groupId}`)
                            .then(data => {
                                const roomsList = document.getElementById('roomsList');
                                roomsList.innerHTML = '';
                                
                                data.data.group.rooms.forEach(room => {
                                    const roomItem = document.createElement('div');
                                    roomItem.className = 'room-list-item';
                                    roomItem.innerHTML = `
                                        <i class="fas fa-hashtag"></i>
                                        <span>${room.name}</span>
                                        <button class="btn btn-small edit-room-btn" data-id="${room._id}">Edit</button>
                                        <button class="btn btn-small btn-danger delete-room-btn" data-id="${room._id}">Delete</button>
                                    `;
                                    roomsList.appendChild(roomItem);
                                });
                            })
                            .catch(err => {
                                showToast(err.message);
                            });
                    })
                    .catch(err => {
                        showToast(err.message);
                    });
            } else {
                apiRequest(`/groups/${groupId}/rooms/${roomId}`, 'PUT', { name, description, type })
                    .then(() => {
                        showToast('Room updated');
                        document.getElementById('roomModal').classList.remove('modal-open');
                        
                        apiRequest(`/groups/${groupId}`)
                            .then(data => {
                                const roomsList = document.getElementById('roomsList');
                                roomsList.innerHTML = '';
                                
                                data.data.group.rooms.forEach(room => {
                                    const roomItem = document.createElement('div');
                                    roomItem.className = 'room-list-item';
                                    roomItem.innerHTML = `
                                        <i class="fas fa-hashtag"></i>
                                        <span>${room.name}</span>
                                        <button class="btn btn-small edit-room-btn" data-id="${room._id}">Edit</button>
                                        <button class="btn btn-small btn-danger delete-room-btn" data-id="${room._id}">Delete</button>
                                    `;
                                    roomsList.appendChild(roomItem);
                                });
                            })
                            .catch(err => {
                                showToast(err.message);
                            });
                    })
                    .catch(err => {
                        showToast(err.message);
                    });
            }
        });
    }

    const groupSettingsForm = document.getElementById('groupSettingsForm');
    if (groupSettingsForm) {
        groupSettingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('groupNameSetting').value;
            const description = document.getElementById('groupDescSetting').value;
            const type = document.getElementById('groupTypeSetting').value;
            
            const urlParams = new URLSearchParams(window.location.search);
            const groupId = urlParams.get('groupId');
            
            apiRequest(`/groups/${groupId}`, 'PUT', { name, description, type })
                .then(data => {
                    showToast('Group settings updated');
                    document.getElementById('groupNameHeader').textContent = data.data.group.name;
                    document.getElementById('groupSidebarName').textContent = data.data.group.name;
                })
                .catch(err => {
                    showToast(err.message);
                });
        });
    }

    const changeGroupPhotoBtn = document.getElementById('changeGroupPhotoBtn');
    if (changeGroupPhotoBtn) {
        changeGroupPhotoBtn.addEventListener('click', () => {
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
                    const urlParams = new URLSearchParams(window.location.search);
                    const groupId = urlParams.get('groupId');
                    
                    apiRequest(`/groups/${groupId}`, 'PUT', { avatar: base64 })
                        .then(data => {
                            showToast('Group photo updated');
                            document.getElementById('groupSidebarPic').style.backgroundImage = `url(${data.data.group.avatar})`;
                        })
                        .catch(err => {
                            showToast(err.message);
                        });
                };
                reader.readAsDataURL(file);
            }
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('friend')) {
        loadFriendChat();
    } else if (urlParams.has('groupId')) {
        loadGroupChat();
    } else {
        window.location.href = 'friends.html';
    }
});