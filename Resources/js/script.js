// const testurl = 'https://openlibrary.org/search.json?q=the+lord+of+the+rings'
const url = 'https://openlibrary.org/search.json?q='

const titleInput = document.getElementById("title-input")
const addBookButtonElement = document.getElementById("addBookButtonModal")
const modalCloseBtn = document.getElementById("btnCloseModal")
let modal = document.getElementById("modal")
let query = titleInput.value.toLowerCase();
const searchDropDownDiv = document.getElementById("searchResults")
const searchHidden = document.querySelector(".searchHidden")
let searchArray = [];
const unorderedList = document.createElement('ul')
const loadingSpinner = document.getElementById('loadingSpinner')
const addBtn = document.getElementById('modalButton')
const ratingInput = document.getElementById("rating-input")

// console.log(bookShelfRemoveBtn)

//on load call function to populate bookshelves
window.addEventListener('load', () => {
  getAllLocalStorageItems();
})

//refresh page
function refreshPage() {
  window.location.reload();
}

//Toggle Add Book Modal
// function toggleModal() {
//   modal.classList.toggle("hidden")
// }
function toggleModalOff() {
  console.log("modal off")
  modal.classList.remove("none")
  modal.classList.add("hidden")
  unorderedList.innerHTML = '';
}

function toggleModalOn() {
  console.log("modal on")
  modal.classList.remove("hidden")
  modal.classList.add("none")
}
//Event Listeners for Add Book Modal
addBookButtonElement.addEventListener("click", toggleModalOn);
modalCloseBtn.addEventListener("click", toggleModalOff);

//object for storing books only used temporarily prior to object being saved to LS
let addBookObj = [
]

//Debouncing so search waits to make the get call to the API and not on every keystroke
function debounce(func, timeout = 600){
  console.log("debounce called from processChange")
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

function inputSearch(){ 
  // processChange;
  // toggleSearchModal();
  
  console.log("inputSearch called")
  //Check if the UL has a search list already and if so clear it if retyping a search
  const listItems = unorderedList.getElementsByTagName('li');
  if(listItems.length > 0) {
    unorderedList.innerHTML = '';
  }
  //call the bookSearch function with the typed in value
  bookSearch(titleInput.value);
  
}

//Debounce called on inputSearch
const processChange = debounce(() => inputSearch());

//Event listener for each keyup release
titleInput.addEventListener("keyup", processChange);

//Search books from API
function bookSearch(query) {
  loadingSpinner.style.display = "block";
  ratingInput.disabled = true;
  //replace any space in text with a + for the newquery
  console.log("booksearch called")
  toggleSearchModalOn();
  let newquery = query.replace(/\s/g, "+");
  var url = 'https://openlibrary.org/search.json?q=' + newquery;
  fetch(url)
  .then(res => {
    return res.json();
  })
  .then(data => {
    let { docs } = data;
    //Notes: do forEach now but then use map to put it in an array
    docs.forEach((doc, index) => {
      createListForSearch(doc, index);
    })
    addSearchListToDropDown();
  })
}

function createListForSearch(doc, index){
  loadingSpinner.style.display= "none";
  console.log("createListForSearch is set off");
  const li = document.createElement('li');
  //LI text in search dropdown
  li.textContent = `**TITLE: ${doc.title}` + "\n" + "**SUBJECT: "+`${attributeForCategory(doc)}` +"\n"+ "**AUTHOR: "+ `${doc.author_name}`;
  //LI data attributes
  li.setAttribute("data-key", doc.key)
  li.setAttribute("data-image", attributeForIsbn(doc))
  li.setAttribute("data-title", doc.title)
  li.setAttribute("data-author", doc.author_name)
  li.setAttribute("data-category", attributeForCategory(doc))
  unorderedList.appendChild(li);
}

function clearUnorderedList() {
  unorderedList.innerHTML = ' ';
}

//image function to add to attribute
function attributeForIsbn(doc) {
  const imgIsbn = doc.isbn?.[0]
  const imgUrl = `https://covers.openlibrary.org/b/isbn/${imgIsbn}`+"-M.jpg"
  //image returned if undefined should be a no image available
  let finalImgUrl = imgUrl === "https://covers.openlibrary.org/b/isbn/undefined" ? "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" : imgUrl;
  return finalImgUrl
}

function attributeForCategory(doc) {
  const categorySubjectFacetArray = doc?.subject_facet;
  const categorySubjectArray = doc?.subject;
  const finalCategory = categorySubjectArray?.slice(0, 4).join(", ");
  let finalCategoryText = finalCategory === undefined ? "N/A" : finalCategory;
  return finalCategoryText
}


//Create the UL from the array of books that match the search
function addSearchListToDropDown(){
  //create elements for ul
  console.log("addSearchListToDropDown is set off")
  unorderedList.setAttribute("id", "searchList");
  searchDropDownDiv.appendChild(unorderedList);
  // toggleSearchModal();
  toggleSearchModalOn();
  return unorderedList;
}

//toggle the dropdown search area when typing in input
// function toggleSearchModal() {
//   console.log("toggleSearchModal function is called inside addSearchListToDropDown")
//   searchHidden.classList.toggle("searchHidden")
// }

function toggleSearchModalOn() {
  console.log("toggle search on")
  searchHidden.classList.remove("searchHidden")
  searchHidden.classList.add("none")
}

function toggleSearchModalOff() {
  console.log("toggle search off")
  searchHidden.classList.remove("none")
  searchHidden.classList.add("searchHidden")
}
//Select the book from search drop down list add a classList and color and pull the book key
searchDropDownDiv.addEventListener('click', (event) => {
  event.preventDefault();
  console.log("searchDropDownDiv event set off")
  const target = event.target;
  if(target.tagName = 'li') {
    target.classList.add('selected');
    let selectedTitleKey = target.dataset.key
    // console.log(selectedTitleKey)
    retrieveBookTitleKey(selectedTitleKey)
    //close the search drop down modal after selecting book title
    // toggleSearchModal();
    toggleSearchModalOff();
    target.classList.remove('selected')
    ratingInput.disabled = false;
    console.log(target.dataset.title)
    titleInput.value = target.dataset.title;
  }
})

function retrieveBookTitleKey(selectedTitleKey){
  console.log(`${selectedTitleKey} has been retrieved via retrieveBookTitleKey function`)
  createBookObject(selectedTitleKey)
  let finalSelectedTitleKey = selectedTitleKey
  return finalSelectedTitleKey
}

function createBookObject(selectedTitleKey) {
  console.log("createBookObject was called")
  const targetId = selectedTitleKey;
  searchDropDownDiv.querySelectorAll('li').forEach(li => {   
    if (li.dataset.key === targetId) {
      const newObject = {
          id: `${li.dataset.key}`,
          image: `${li.dataset.image}`,
          title: `${li.dataset.title}`,
          author: `${li.dataset.author}`,
          category: `${li.dataset.category}`
       }
      addBookObj.push(newObject)
    }
  })
}

//Local Storage Save data
function saveToLocalStorage(targetId, newObject) {
  console.log("saveToLocalStorage is called")
  localStorage.setItem(targetId, JSON.stringify(newObject))
}

//Local Storage Get Data
function getDataLocalStorage(key) {
  console.log("getDataLocalStorage is called")
  const storedLocalStorageData = localStorage.getItem(key)
  const localStorageParsedData = JSON.parse(storedLocalStorageData)
  // console.log(localStorageParsedData)
  // console.log(localStorageParsedData.id)
  return localStorageParsedData
}

//Local Storage remove item then refresh page
function removeItemLocalStorage(key) {
  localStorage.removeItem(key);
  console.log(`${key} has been removed`)
  refreshPage();
}

addBtn.addEventListener('click', (e)=> {
  e.preventDefault();
  validateForm();
  saveRatings();
  toggleModalOn();
  titleInput.value = "";
  ratingInput.value = "";
  
})

function validateForm() {
  console.log("validateForm is called")
  const titleInputValue = titleInput.value;
  const ratingInputValue = ratingInput.value;
  if(titleInputValue === '' || ratingInputValue === '') {
    alert('Please fill in all fields.')
    return false;
  }
    return true;
}

function saveRatings() {
  console.log("saveRatings is called")
  const newId = addBookObj[`${addBookObj.length}` - 1].id;
  const ratingInputNumber = ratingInput.value;
  addBookObj[`${addBookObj.length}` - 1].ratings = ratingInputNumber
  const lastObj = addBookObj[`${addBookObj.length}` - 1]
  saveToLocalStorage(newId, lastObj);
  const lsStoredData = getDataLocalStorage(newId);
  createNewBookShelfRow(lsStoredData);
  //clear the object
  addBookObj = [];
}

function createNewBookShelfRow(lsStoredData) {
  console.log("createNewBookShelfRow is called")
  const bookShelfDivRow = document.createElement("div");
  bookShelfDivRow.setAttribute("class", "flex-table row");

  const imageDiv = document.createElement("div");
  imageDiv.setAttribute("class", "flex-row imgTitle");
  const imgElem = document.createElement('img');
  // imgElem.src = addBookObj[`${addBookObj.length}` - 1].image;
  imgElem.src = lsStoredData.image;
  imgElem.setAttribute("class", "bookImage")
  imageDiv.appendChild(imgElem);

  const titleDiv = document.createElement("div");
  titleDiv.setAttribute("class", "flex-row bookTitle");
  // titleDiv.textContent = addBookObj[`${addBookObj.length}` - 1].title
  titleDiv.setAttribute("data-title-id", lsStoredData.id)
  titleDiv.setAttribute("data-title-title", lsStoredData.title)
  titleDiv.textContent = lsStoredData.title;
  imageDiv.appendChild(titleDiv);
  bookShelfDivRow.appendChild(imageDiv);

  const ratingsDiv = document.createElement("div");
  ratingsDiv.setAttribute("class", "flex-row ratings");
  // ratingsDiv.textContent = addBookObj[`${addBookObj.length}` - 1].ratings
  ratingsDiv.textContent = lsStoredData.ratings;
  bookShelfDivRow.appendChild(ratingsDiv);

  const categoryDiv = document.createElement("div");
  categoryDiv.setAttribute("class", "flex-row category");
  // categoryDiv.textContent = addBookObj[`${addBookObj.length}` - 1].category
  categoryDiv.textContent = lsStoredData.category;
  bookShelfDivRow.appendChild(categoryDiv);

  const authorDiv = document.createElement("div");
  authorDiv.setAttribute("class", "flex-row author");
  // authorDiv.textContent = addBookObj[`${addBookObj.length}` - 1].author
  authorDiv.textContent = lsStoredData.author;
  bookShelfDivRow.appendChild(authorDiv);


  const buttonsDiv = document.createElement("div");
  buttonsDiv.setAttribute("class", "flex-row-buttons");
  bookShelfDivRow.appendChild(buttonsDiv);

  const seeMoreDiv = document.createElement("div");
  seeMoreDiv.setAttribute("class", "flex-row");
  const seeMoreBtn = document.createElement("button");
  seeMoreBtn.setAttribute("id", "seeMoreBtn");
  seeMoreBtn.textContent = 'See more';
  buttonsDiv.appendChild(seeMoreDiv);
  seeMoreDiv.appendChild(seeMoreBtn);

  const removeButtonDiv = document.createElement("div");
  removeButtonDiv.setAttribute("class", "flex-row");
  const removeBtn = document.createElement("button");
  removeBtn.setAttribute("id", "removeBtn");
  removeBtn.textContent = 'Remove';
  //Have to add the eventListener before button is added to dom
  removeBtn.addEventListener("click", (e) => {
    console.log(e.target)
    console.log("remove button clicked")
    removeItemLocalStorage(lsStoredData.id)
  });

  removeButtonDiv.appendChild(removeBtn);
  buttonsDiv.appendChild(removeButtonDiv);

  const bookshelfContainer = document.getElementById("bookshelfContainer");
  bookshelfContainer.appendChild(bookShelfDivRow);
}

//Get all the LS items and populate the bookshelf
function getAllLocalStorageItems() {
  console.log("getAllLocalStorageItems is called")
  const keys = Object.keys(localStorage);
  const objects = {};
  //Get each key and value from LS and create a book shelf row from the value
  keys.forEach(key => {
    const value = localStorage.getItem(key);
    objects[key] = JSON.parse(value);
    createNewBookShelfRow(objects[key]);
  });

  return objects;
}
