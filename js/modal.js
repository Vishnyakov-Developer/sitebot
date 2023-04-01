let currentModal = undefined;

document.querySelectorAll('.modal').forEach(e => {
    e.addEventListener('click', (ctx) => {
        const element = ctx.target;
    
        if(element.classList.contains('modal')) {
            closeModal();
        }
    
        if(element.classList.contains('two')) {
            closeModal();
        }
    });
})

function closeModal() {
    try {
        currentModal.classList.add('none');
        currentModal = undefined;
        return true;
    } catch(e) {
        
    }
    
}

function openModal(name) {
    currentModal = document.querySelector(`.modal[name="${name}"]`);
    currentModal.classList.remove('none');
}