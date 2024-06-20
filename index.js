import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://shoppinglist-f3431-default-rtdb.firebaseio.com/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const shoppingListInDB = ref(database, "shoppingList")

const inputFieldEl = document.getElementById("input-field")
const addButtonEl = document.getElementById("add-button")
const shoppingListEl = document.getElementById("shopping-list")

let isAdding = false;

// Function to add item
function addItem() {
    if (isAdding) return; // Debounce check

    let inputValue = inputFieldEl.value.trim();
    
    if (inputValue !== "") {
        isAdding = true;
        push(shoppingListInDB, inputValue).then(() => {
            console.log(`Added item: ${inputValue}`);
            clearInputFieldEl();
        }).catch((error) => {
            console.error("Error adding item:", error);
        }).finally(() => {
            isAdding = false;
        });
    } else {
        console.log("Ignored empty input");
    }
}

addButtonEl.addEventListener("click", addItem);

// Event listener for Enter key press in input field
inputFieldEl.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        addItem();
    }
});

onValue(shoppingListInDB, function(snapshot) {
    if (snapshot.exists()) {
        let itemsArray = Object.entries(snapshot.val());
    
        clearShoppingListEl();
        
        let fragment = document.createDocumentFragment();
        for (let i = 0; i < itemsArray.length; i++) {
            let currentItem = itemsArray[i];
            appendItemToShoppingListEl(currentItem, fragment);
        }
        shoppingListEl.appendChild(fragment);
    } else {
        shoppingListEl.innerHTML = "Add some goodies to your cart!";
    }
});

function clearShoppingListEl() {
    shoppingListEl.innerHTML = "";
}

function clearInputFieldEl() {
    inputFieldEl.value = "";
}

function appendItemToShoppingListEl(item, fragment) {
    let itemID = item[0];
    let itemValue = item[1];
    
    let newEl = document.createElement("li");
    newEl.textContent = itemValue;
    newEl.setAttribute("data-id", itemID);
    
    fragment.appendChild(newEl);
}

// Event delegation for shopping list items
shoppingListEl.addEventListener("click", function(event) {
    if (event.target.tagName === "LI") {
        let itemID = event.target.getAttribute("data-id");
        let exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`);
        
        remove(exactLocationOfItemInDB).catch((error) => {
            console.error("Error removing item:", error);
        });
    }
});
