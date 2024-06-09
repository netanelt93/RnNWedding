// List of images and their hidden numbers
const pictures = [
    { src: 'static/pic1.jpg', number: 7 },
    { src: 'static/pic2.jpg', number: 0 },
    { src: 'static/pic3.jpg', number: 6 },
    { src: 'static/pic4.jpg', number: 2 }
];

// Predetermined correct order
const correctOrder = [2, 7, 0, 6];

let dragged;

// Initialize the container with empty slots and pictures
window.onload = function() {
    const pictureRow = document.getElementById('pictureRow');
    const slotRow = document.getElementById('slotRow');
    const slotCount = pictures.length;

    pictures.forEach((picture, index) => {
        const div = createPictureDiv(picture);
        pictureRow.appendChild(div);
    });

    const images = document.querySelectorAll('.disable-context-menu');

    images.forEach(image => {
        image.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });

        image.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        image.addEventListener('mousedown', function(e) {
            if (e.button === 2) {
                e.preventDefault();
            }
        });
    });

    for (let i = 0; i < slotCount; i++) {
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.ondragover = dragOver;
        slot.ondrop = drop;
        const number = document.createElement('span');
        number.innerText = i + 1; // Add the number (1-based index)
        slot.appendChild(number);

        slotRow.appendChild(slot);    }

    // Initialize numbers to be hidden
    const hiddenNumbers = document.querySelectorAll('.hidden-number');
    hiddenNumbers.forEach(number => {
        number.style.display = 'none';
    });

    // Disable the check button initially
    document.getElementById('checkBtn').disabled = true;

    // Initialize visit count
    if (!localStorage.getItem('visitCount')) {
        localStorage.setItem('visitCount', '1');
    } else {
        let count = parseInt(localStorage.getItem('visitCount')) + 1;
        localStorage.setItem('visitCount', count.toString());
    }
    console.log(`This site has been visited ${localStorage.getItem('visitCount')} times.`);
};

// Drag and drop functions
function dragStart(event) {
    dragged = event.target.closest('.picture');
    event.dataTransfer.effectAllowed = 'move';
}

function dragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
}

function drop(event) {
    event.preventDefault();
    const target = event.target.closest('.slot, .picture');

    if (target.className === 'slot') {
        // Dropping onto an empty slot
        if (target.children.length === 0) {
            target.appendChild(dragged);
        } else {
            // Swap with the picture in the slot
            const targetPicture = target.querySelector('.picture');
            const draggedParent = dragged.parentNode;
            draggedParent.appendChild(targetPicture);
            target.appendChild(dragged);
        }
    } else if (target.className === 'picture') {
        // Dropping onto another picture
        const targetSlot = target.parentNode;
        const draggedSlot = dragged.parentNode;
        
        // Swap the pictures between slots
        draggedSlot.appendChild(target);
        targetSlot.appendChild(dragged);
    }

    // Reattach drag events to the moved elements
    reattachDragEvents(dragged);
    if (target.className === 'picture') {
        reattachDragEvents(target);
    }

    // Check if all slots are filled and enable/disable the check button accordingly
    const slots = document.querySelectorAll('#slotRow .slot');
    const allSlotsFilled = Array.from(slots).every(slot => slot.children.length > 0);
    document.getElementById('checkBtn').disabled = !allSlotsFilled;
}

function reattachDragEvents(element) {
    element.draggable = true;
    element.ondragstart = dragStart;
}

function createPictureDiv(picture) {
    const div = document.createElement('div');
    div.className = 'picture';
    div.draggable = true;
    div.ondragstart = dragStart;
    div.innerHTML = `
        <img class="disable-context-menu" src="${picture.src}" onclick="showOriginalSize('${picture.src}')">
        <div class="hidden-number">${picture.number}</div>
    `;
    return div;
}

// Function to show the image in its original size
function showOriginalSize(src) {
    const modal = document.getElementById('imageModal');
    const img = document.getElementById('originalImage');
    img.src = src;
    modal.style.display = 'block';

    // Close the modal when clicking the close button or outside the image
    const closeBtn = document.getElementsByClassName('close')[0];
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }
    modal.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
}

// Function to both reveal numbers and check order
function checkOrder() {
    const slots = document.querySelectorAll('#slotRow .slot');
    const hiddenNumbers = document.querySelectorAll('.hidden-number');
    const currentOrder = [];

    // Reveal all numbers
    hiddenNumbers.forEach(number => {
        number.style.display = 'flex';
        currentOrder.push(parseInt(number.textContent));
    });

    // Fill in the pincode boxes
    const pincodeBoxes = document.querySelectorAll('.pincode-box');
    currentOrder.forEach((num, index) => {
        pincodeBoxes[index].value = num;
    });

    document.getElementById('verifyBtn').disabled = false;


    // Show the pincode container
    document.getElementById('pincodeContainer').style.display = 'block';

    // Hide the numbers after 3 seconds
    setTimeout(() => {
        hiddenNumbers.forEach(number => {
            number.style.display = 'none';
        });
    }, 1500);

}

// Function to show the question
function showQuestion(question) {
    const modal = document.getElementById('imageModal');
    const questionElement = document.createElement('p');
    questionElement.textContent = question;
    questionElement.style.cssText = 'color: white; font-size: 36px; text-align: center; margin-top: 20px; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); z-index: 1001;';
    
    modal.appendChild(questionElement);
    modal.style.display = 'block';

    // Add a semi-transparent overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.8); z-index: 1000;';
    modal.insertBefore(overlay, modal.firstChild);

    // Close the modal and remove the question when clicking anywhere
    modal.onclick = function() {
        modal.style.display = 'none';
        modal.removeChild(questionElement);
        modal.removeChild(overlay);
    }
}

function showLineAndScroll(line) {
    // Show the line
    document.getElementById(line).style.display = 'block';

    // Scroll to the line
    document.getElementById(line).scrollIntoView({ behavior: 'smooth' });
}



// Function to verify the pincode
function verifyPincode() {
    const pincodeBoxes = document.querySelectorAll('.pincode-box');
    const enteredOrder = Array.from(pincodeBoxes).map(box => parseInt(box.value));

    // Check if the order is correct
    const isCorrect = arraysEqual(enteredOrder, correctOrder);

    const resultContainer = document.getElementById('resultContainer');
    const verificationMark = document.getElementById('verificationMark');
    const resultText = document.getElementById('resultText');

    if (isCorrect) {
        resultContainer.style.display = 'block';
        verificationMark.style.display = 'inline-block';
        resultText.textContent = "Congratulations! You got the order right!";
        resultText.style.color = '#28a745'; // Bootstrap's success color

        // Add a shimmering effect to the golden checkmark
        verificationMark.animate([
            { opacity: 1, transform: 'scale(1) rotate(0deg)' },
            { opacity: 0.8, transform: 'scale(1.2) rotate(10deg)', offset: 0.5 },
            { opacity: 1, transform: 'scale(1) rotate(0deg)' }
        ], {
            duration: 1000,
            iterations: 2,
            easing: 'ease-in-out'
        });

        // Show the question based on user's visit count
        const visitCount = parseInt(localStorage.getItem('visitCount'));
        const question = visitCount % 2 === 0 ? "מה השם של החתולה שלהם?" : "מה השם של הכלבה שלהם?";
        setTimeout(showLineAndScroll('secondQuestion'), 2000);
        document.getElementById('dynamicTitle').innerText=question;
        document.getElementById('secondQuestion').style.display = 'block';
        document.getElementById('secondQuestion').scrollIntoView({ behavior: 'smooth' });

        //showQuestion(question);

        
    } else {
        resultContainer.style.display = 'block';
        verificationMark.style.display = 'none';
        resultText.textContent = "Not quite right. Try again!";
        resultText.style.color = '#dc3545'; // Bootstrap's danger color
    }

    // Hide the pincode container after verification
    //document.getElementById('pincodeContainer').style.display = 'none';
}

// Helper function to compare arrays
function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}
