document.addEventListener('DOMContentLoaded', () => {
    const itemNameInput = document.getElementById('itemName');
    const itemTypeSelect = document.getElementById('itemType');
    const fileContentInput = document.getElementById('fileContent');
    const createBtn = document.getElementById('createBtn');
    const itemsList = document.getElementById('itemsList');

    // Fetch and display items on load
    loadItems();

    createBtn.addEventListener('click', createItem);

    async function loadItems() {
        try {
            const response = await fetch('/api/items');
            const items = await response.json();
            renderItems(items);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    }

    async function createItem() {
        const name = itemNameInput.value.trim();
        const type = itemTypeSelect.value;
        const content = fileContentInput.value.trim();

        if (!name) {
            alert('Please enter a name!');
            return;
        }

        try {
            const response = await fetch('/api/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, type, content })
            });

            if (response.ok) {
                itemNameInput.value = '';
                fileContentInput.value = '';
                loadItems(); // Refresh the list
            } else {
                alert('Failed to create item');
            }
        } catch (error) {
            console.error('Error creating item:', error);
        }
    }

    function renderItems(items) {
        itemsList.innerHTML = '';

        if (items.length === 0) {
            itemsList.innerHTML = '<p>No files or folders created yet.</p>';
            return;
        }

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = `item-card ${item.item_type}`;

            const icon = item.item_type === 'folder' ? '📁' : '📄';
            const details = item.item_type === 'file' && item.content ? `<br><small>Content: ${item.content}</small>` : '';

            card.innerHTML = `
                <div class="item-info">
                    <span class="item-title">${icon} ${item.name}</span>
                    <span class="item-subtext">Created: ${item.created_at} ${details}</span>
                </div>
            `;

            itemsList.appendChild(card);
        });
    }
});
