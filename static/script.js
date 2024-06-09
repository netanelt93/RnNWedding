const pictures = [
    { src: 'static/pic1.jpg', number: 7 },
    { src: 'static/pic2.jpg', number: 0 },
    { src: 'static/pic3.jpg', number: 6 },
    { src: 'static/pic4.jpg', number: 2 }
];

const correctOrder = [2, 7, 0, 6];
let dragged;

window.onload = function() {
    const pictureRow = document.getElementById('pictureRow');
    const slotRow = document.getElementById('slotRow');

    pictures.forEach(picture => {
        const div = createPictureDiv(picture);
        pictureRow.appendChild(div);
    });

    for (let i = 0; i < pictures.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.ondragover = dragOver;
        slot.ondrop = drop;
        slotRow.appendChild(slot);
    }

    disableContextMenu();
    initializeVisitCount();
};

function createPictureDiv(picture) {
    const div = document.createElement('div');
    div.className = 'picture';
    div.draggable = true;
    div.ondragstart = dragStart;
    div.onclick = openModal;

    const img = document.createElement('img');
    img.src = picture.src;
    img.dataset.number = picture.number;
    img.draggable = false;

    div.appendChild(img);
    return div;
}

function dragStart(event) {
    dragged = event.target;
    event.dataTransfer.setData('text/html', dragged.innerHTML);
}

function dragOver(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    if (event.target.classList.contains('slot')) {
        event.target.innerHTML = dragged.innerHTML;
        dragged.parentNode.innerHTML = '';
    }
    document.getElementById('checkBtn').disabled = !checkIfSlotsFilled();
}

function checkIfSlotsFilled() {
    const slots = document.querySelectorAll('.slot');
    return Array.from(slots).every(slot => slot.innerHTML.trim() !== '');
}

function checkOrder() {
    const slots = document.querySelectorAll('.slot img');
    const currentOrder = Array.from(slots).map(img => parseInt(img.dataset.number));
    const pincodeBoxes = document.querySelectorAll('.pincode-box');

    for (let i = 0; i < currentOrder.length; i++) {
        pincodeBoxes[i].value = currentOrder[i];
    }

    if (arraysEqual(currentOrder, correctOrder)) {
        enablePincodeVerification();
        showSuccessMessage();
    } else {
        showErrorMessage();
    }
}

function arraysEqual(arr1, arr2) {
    return JSON.stringify(arr1) === JSON.stringify(arr2);
}

function enablePincodeVerification() {
    document.getElementById('verifyBtn').disabled = false;
}

function showSuccessMessage() {
    document.getElementById('resultText').innerText = 'Success!';
    document.getElementById('resultContainer').style.display = 'block';
    document.getElementById('resultText').style.color = 'green';
}

function showErrorMessage() {
    document.getElementById('resultText').innerText = 'Try again!';
    document.getElementById('resultContainer').style.display = 'block';
    document.getElementById('resultText').style.color = 'red';
}

function verifyPincode() {
    document.getElementById('secondQuestion').style.display = 'block';
    document.getElementById('dynamicTitle').textContent = 'What is 4 times 2?';
}

function openModal(event) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('originalImage');

    modal.style.display = 'block';
    modalImg.src = event.target.src;
}

const closeModalBtn = document.getElementsByClassName('close')[0];
closeModalBtn.onclick = function() {
    document.getElementById('imageModal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('imageModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

function disableContextMenu() {
    document.addEventListener('contextmenu', event => event.preventDefault());
}

function initializeVisitCount() {
    const visitCount = localStorage.getItem('visitCount') || 0;
    localStorage.setItem('visitCount', parseInt(visitCount) + 1);
}
