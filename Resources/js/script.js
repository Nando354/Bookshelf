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
const categoryInput = document.getElementById('category-input')
const categoryInputandListDiv = document.getElementById('categoryInputAndListDiv')
const categoryList = document.getElementById('categoryListSection')
const bookshelfHeaderContainer = document.getElementById('bookshelfHeaderContainer')
const categoryHidden = document.querySelector(".categoryHidden")
const categoryUnorderedList = document.getElementById("catUl");
let categoryAllArray = [];
let groupedCategoryObj = {};

// console.log(bookShelfRemoveBtn)

//on load call function to populate bookshelves
window.addEventListener('load', () => {
  console.log("window load called")
  getAllLocalStorageItems();
})

//refresh page
function refreshPage() {
  console.log("refreshPage called")
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
  console.log("booksearch called")
  loadingSpinner.style.display = "block";
  ratingInput.disabled = true;
  //replace any space in text with a + for the newquery
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
  console.log("createListForSearch is set off");
  loadingSpinner.style.display= "none";
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
  console.log("clearUnorderedList called")
  unorderedList.innerHTML = ' ';
}

//image function to add to attribute
function attributeForIsbn(doc) {
  console.log("attributeForIsbn called")
  const imgIsbn = doc.isbn?.[0]
  const imgUrl = `https://covers.openlibrary.org/b/isbn/${imgIsbn}`+"-M.jpg"
  //image returned if undefined should be a no image available
  let finalImgUrl = imgUrl === "https://covers.openlibrary.org/b/isbn/undefined" ? "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" : imgUrl;
  return finalImgUrl
}

function attributeForCategory(doc) {
  console.log("attributeForCategory called")
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
  console.log(`${key} has been removed via removeItemLocalStorage`)
  refreshPage();
}

addBtn.addEventListener('click', (e)=> {
  e.preventDefault();
  console.log("addBtn clicked")
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

function getAllDataLocalStorage() {
  console.log("getAllDataLocalStorage is called")
  const keys = Object.keys(localStorage);
  const lsObjects = {};
  // const lsValues = [];
  keys.forEach(key => {
    const value = localStorage.getItem(key);
    lsObjects[key] = JSON.parse(value);
    // lsValues.push(value);
  });
  return lsObjects;
}

const allLsObjects = getAllDataLocalStorage();
// console.log(allLsObjects);

categoryInput.addEventListener('click', getAllCategories)


//Creates the drop down for the categories
function getAllCategories() {
  toggleCategoryModalOn();
  console.log("getAllCategories functions set off")
  let categoryKey;
  let lsCategory;
  for(const key in allLsObjects) {
    categoryKey = key;
    // console.log(categoryKey)
    lsCategory = allLsObjects[key].category;
    // console.log(lsCategory)
    let categorySplit = lsCategory.split(',');
    // console.log(categorySplit)
    let singleCategory = categorySplit[0].toUpperCase();
    // console.log(singleCategory)
    //move to object
    categoryAllArray.category = singleCategory;
    categoryAllArray.id = categoryKey;
    categoryAllArray.push({ 'category': singleCategory, 'id': categoryKey}) 
  }  
  groupCategories();
  // console.log(categoryAllArray)
}

//Consoles
// console.log(`Call array of objects where the categories are stored categoryAllArray ${console.log(categoryAllArray)}`)
// console.log(getAllCategories())
//This is the object with the categories grouped together and(keys) per each category
console.log(`Call the object where the categories are grouped together and shows each related ID ${console.log(groupedCategoryObj)}`)

//Groups the categories by category and each id related to the category and put it in an object
function groupCategories() {
  console.log("groupCategories was called")
  categoryAllArray.forEach(item => {
   const { category, id } = item;
   if (!groupedCategoryObj[category]) {
    groupedCategoryObj[category] = [];
   }
   groupedCategoryObj[category].push(id);
  });  
  createCategoryDropDownList();
}

//Create the dropdown list for categories with only one of each category
function createCategoryDropDownList() {
  //  Check if the UL has a search list already and if so clear it if retyping a search
  console.log('createCategoryDropDownList was called')
  const categoryDiv = document.getElementById("categoryListSection");
  categoryInputandListDiv.appendChild(categoryDiv);
  const categoryUl = document.createElement('ul');
  categoryUl.setAttribute("id", "catUl")
  categoryDiv.appendChild(categoryUl);
  const categoryListItems = categoryUl.getElementsByTagName('li');
  console.log(categoryListItems)
  console.log(categoryListItems.length)
  if(categoryListItems.length > 0) {
   console.log("categoryListItems is greater than 0")
   //  categoryUnorderedList.innerHTML = '';
  }
  //Create the dropdown list via the object of categories and set attributes with the id's
  Object.keys(groupedCategoryObj).forEach(key => {
    // console.log(`${key}: ${groupedCategoryObj[key]}`);
    const categoryLi = document.createElement("li");
    categoryLi.setAttribute("class", "catLi")
    categoryLi.setAttribute("data-categoryid", groupedCategoryObj[key])
    categoryLi.innerText = key;
    categoryUl.appendChild(categoryLi);
  })
   //Check if the UL has a search list already and if so clear it if retyping a search
  //  const categoryListItems = categoryUnorderedList.getElementsByTagName('li');
  //  if(categoryListItems.length > 0) {
  //   console.log("categoryListItems is greater than 0")
  //    categoryUnorderedList.innerHTML = '';
  //  }
}

//click on category to get the id and show the list of books from that category
categoryList.addEventListener('click', (event) => {
  event.preventDefault();
  console.log("categorList section clicked");
  const target = event.target;
  if(target.tagName = 'li') {
    console.log("target clicked")
    removeBookShelfItems();
    target.classList.add('selected')
    let selectedCategoryId = target.dataset.categoryid;
    const idOfBooks = selectedCategoryId;
    const idSplitter = idOfBooks.split(',');
    console.log(idSplitter)
    idSplitter.forEach((id) => {
      console.log(getDataLocalStorage(id))
      let categoryIds = getDataLocalStorage(id); 
      const bookshelfContainer = document.createElement('div');
      bookshelfContainer.setAttribute('id', 'bookshelfContainer');
      bookshelfHeaderContainer.appendChild(bookshelfContainer);
      createNewBookShelfRow(categoryIds);
      toggleCategoryModalOff();
    })
    target.classList.remove('selected')
    // console.log(getDataLocalStorage(selectedCategoryId));

    //close the modal
    //remove the blue color

    // retrieveBookTitleKey(selectedTitleKey)
    // //close the search drop down modal after selecting book title
    // // toggleSearchModal();
    // toggleSearchModalOff();
    // target.classList.remove('selected')
    // ratingInput.disabled = false;
    // console.log(target.dataset.title)
    // titleInput.value = target.dataset.title;
  }
})
//Remove all the LS items in bookshelf to show only categoy items selected from LS
function removeBookShelfItems() {
  console.log("removeBookShelItems called")
  window.removeEventListener('load', console.log('load removed'));
  const elementToRemove = document.getElementById('bookshelfContainer');
  console.log(`${elementToRemove} is being removed`)
  elementToRemove.parentNode.removeChild(elementToRemove);
}

function toggleCategoryModalOn() {
  console.log("toggle category modal on")
  categoryList.classList.remove("categoryHidden")
  categoryList.classList.add("categoryNotHidden")
}

function toggleCategoryModalOff() {
  console.log("toggle category modal off")
  categoryList.classList.remove("categoryNotHidden")
  categoryList.classList.add("categoryHidden")
}