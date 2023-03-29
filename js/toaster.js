const toaster = document.querySelector('.toaster');
class Toaster {
    constructor(text, wait) {
        toaster.classList.remove('none');
        toaster.classList.remove('toaster__none');

        setTimeout(() => {
            this.hide();
        }, wait)
    }
    hide() {
        toaster.classList.add('toaster__none');
    }
}
