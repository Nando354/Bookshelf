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
let categoryButton = document.getElementById('category-button')
const categoryInputandListDiv = document.getElementById('categoryInputAndListDiv')
const categoryList = document.getElementById('categoryListSection')
const bookshelfHeaderContainer = document.getElementById('bookshelfHeaderContainer')
const categoryHidden = document.querySelector(".categoryHidden")
const mainBookshelfContainer = document.getElementById("bookshelfContainer")
const categoryDiv = document.getElementById("categoryListSection")
console.log(mainBookshelfContainer)

// let listItemForContainer
let categoryAllArray = [];
let groupedCategoryObj = {};
let selectedCategoryArray = [];
//All data from LS stored in this array
let allLocalStorageBooksArray = [];
console.log(allLocalStorageBooksArray)
let displayBookDataArray = [];

//on load call function to populate bookshelves on load
window.addEventListener('load', () => {
  console.log("window load called")
  //retrieve all saved book data from Local Storage and load it into allLocalStorageBooksArray. This function also calls populateBookshelf() to display the books.
  storeLocalStorageItemsToArray();
  //See More button accessed after its creation or being fully loaded in the dom
  const seeMoreButtons = document.querySelectorAll('.seeMoreBtn');
  //Add an eventListener to each SeeMore button in the book list, pass the id to seeMoreData function which creates the modal
  seeMoreButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      console.log("seeMoreButton Clicked")
      console.log(e.target)
      console.log(e.target.parentElement.parentElement.parentElement)
      console.log(e.target.parentElement.parentElement.parentElement.children[0].children[1].dataset.titleId)
      let selectedSeeMoreTitleId = e.target.parentElement.parentElement.parentElement.children[0].children[1].dataset.titleId;
      console.log("call function to create the see more button window with data")
      seeMoreData(selectedSeeMoreTitleId);
    });
  });  
})

//refresh page
function refreshPage() {
  console.log("refreshPage called")
  window.location.reload();
}

//Add book and ratings modal off
function toggleModalOff() {
  console.log("modal off")
  modal.classList.remove("none")
  modal.classList.add("hidden")
  unorderedList.innerHTML = '';
}
//Add book and ratings modal on
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

//----Title input search Area in search modal------
//Book Search (Typing): An event listener is attached to the titleInput for the "keyup" event. This listener calls the processChange() function, which uses a debounce utility to ensure that inputSearch() (which triggers the API call) only runs after the user pauses typing.

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
console.log("debounce will call due to debounce()")
//Event listener for each keyup release in title input in search modal
titleInput.addEventListener("keyup", processChange);

//Search books from API once a query is typed into title input in search modal form
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
//Searching via drop down search modal
//creates dom for search dropdown li for book search using data attributes to store all but rating from API to li
//This is different from the object created to store in LS which includes the rating
function createListForSearch(doc, index){
  console.log("createListForSearch is set off");
  loadingSpinner.style.display= "none";
  const li = document.createElement('li');
  //LI text in search dropdown
  li.textContent = `**TITLE: ${doc.title}` +"\n"+ "**AUTHOR: "+ `${doc.author_name}` + "\n" + "**1st Publish Year: "+`${doc.first_publish_year}`;
  //LI data attributes
  li.setAttribute("data-key", doc.key)
  li.setAttribute("data-image", attributeForCoverId(doc))
  li.setAttribute("data-title", doc.title)
  li.setAttribute("data-author", doc.author_name)
  li.setAttribute("data-first_publish_year", doc.first_publish_year)
  // li.setAttribute("data-category", attributeForCategory(doc))
  

  //create attributes to store data for See More Button
  li.setAttribute("data-publisher", doc.publisher)
  li.setAttribute("data-publish_year", doc.publish_year)
  li.setAttribute("data-ratings_average", doc.ratings_average)
  li.setAttribute("data-first_sentence", doc.first_sentence)
  console.log(li)
  unorderedList.appendChild(li);
}

//search ul to clear
function clearUnorderedList() {
  console.log("clearUnorderedList called")
  unorderedList.innerHTML = ' ';
}

//image function to add to attribute
function attributeForIsbn(doc) {
  console.log("attributeForIsbn called")
  // const imgIsbn = doc.isbn?.[0]
  const imgIsbn = doc.isbn ? doc.isbn[0] : "undefined";
  console.log(imgIsbn)
  const imgUrl = `https://covers.openlibrary.org/b/isbn/${imgIsbn}`+"-M.jpg"
  //image returned if undefined should be a no image available
  let finalImgUrl = imgUrl === "https://covers.openlibrary.org/b/isbn/undefined" ? "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" : imgUrl;
  return finalImgUrl
}

//cover id function to add to attribute, works better than isbn to retrieve cover image
function attributeForCoverId(doc) {
  console.log("attributeForCoverId called")
  const coverId = doc?.cover_i;
  const coverUrl = `https://covers.openlibrary.org/b/id/${coverId}`+"-M.jpg"
  let finalCoverUrl = coverUrl === "https://covers.openlibrary.org/b/id/undefined-M.jpg" ? "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg" : coverUrl;
  return finalCoverUrl  
}

function attributeForCategory(doc) {
  console.log("attributeForCategory called")
  const categorySubjectFacetArray = doc?.subject_facet;
  const categorySubjectArray = doc?.subject;
  const finalCategory = categorySubjectArray?.slice(0, 1).join(", ");
  let finalCategoryText = finalCategory === undefined ? "N/A" : finalCategory;
  return finalCategoryText
}

//Create the UL from the array of books that match the search and attaches to search div
function addSearchListToDropDown(){
  //create elements for ul
  console.log("addSearchListToDropDown is set off")
  unorderedList.setAttribute("id", "searchList");
  searchDropDownDiv.appendChild(unorderedList);
  // toggleSearchModal();
  toggleSearchModalOn();
  return unorderedList;
}

//Search dropDown modal on
function toggleSearchModalOn() {
  console.log("toggle search on")
  searchHidden.classList.remove("searchHidden")
  searchHidden.classList.add("none")
}

//Search dropdown modal off
function toggleSearchModalOff() {
  console.log("toggle search off")
  searchHidden.classList.remove("none")
  searchHidden.classList.add("searchHidden")
}

//Select the book title key from searchdropdowndiv list add a classList and color for selected item call retrieveBookTitleKey function
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
    //disable rating input field while looking for book on dropdown
    ratingInput.disabled = false;
    console.log(target.dataset.title)
    titleInput.value = target.dataset.title;
  }
})

//Called when book is selected from search dropdown, uses the title key to createBookObject
function retrieveBookTitleKey(selectedTitleKey){
  console.log(`${selectedTitleKey} has been retrieved via retrieveBookTitleKey function`)
  checkIfTitleKeyIsAlreadyStored(selectedTitleKey)
  
  let finalSelectedTitleKey = selectedTitleKey
  return finalSelectedTitleKey
}

//Checks if the selected title key is already stored in LS, if not calls createBookObject to create the object to store in LS
function checkIfTitleKeyIsAlreadyStored(selectedTitleKey) {
  console.log(getDataLocalStorage(selectedTitleKey))
  if(getDataLocalStorage(selectedTitleKey) !== null){
    console.log("item exists already")
    alert("Book already in bookshelf, choose another title")
  } else {
    console.log('item does not exist')
    createBookObject(selectedTitleKey)
  }
}

//Creates an array of addBookObj from newObject made up of selected book and all the li datasets
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
          category: `${li.dataset.category}`,
          publisher: `${li.dataset.publisher}`,
          publishYear: `${li.dataset.publish_year}`,
          firstPublishYear: `${li.dataset.first_publish_year}`,
          ratingsAverage: `${li.dataset.ratings_average}`,
          firstSentence: `${li.dataset.first_sentence}`
       }
       console.log(newObject)
      addBookObj.push(newObject)
    }
  })
}

//-----LOCAL STORAGE FUNCTIONS---

//Local Storage Save data from newObject after stringified to Local Storage
function saveToLocalStorage(targetId, newObject) {
  console.log("saveToLocalStorage is called")
  localStorage.setItem(targetId, JSON.stringify(newObject))
}

//Local Storage Get Data from Local Storage by specific key
function getDataLocalStorage(key) {
  console.log("getDataLocalStorage is called")
  const storedLocalStorageData = localStorage.getItem(key)
  const localStorageParsedData = JSON.parse(storedLocalStorageData)
  // console.log(localStorageParsedData)
  // console.log(localStorageParsedData.id)
  return localStorageParsedData
}

//Local Storage remove item from Local Storage (remove button) then refresh page
function removeItemLocalStorage(key) {
  localStorage.removeItem(key);
  console.log(`${key} has been removed via removeItemLocalStorage`)
  refreshPage();
}

//Local Storage - Get all the LS items and populate the bookshelf, function is called on original page load
function getAllLocalStorageItems() {
  console.log("getAllLocalStorageItems is called")
  const keys = Object.keys(localStorage);
  const tempObject = {};
  //Get each key and value from LS and create a book shelf row from the value
  keys.forEach(key => {
    const value = localStorage.getItem(key);
    tempObject[key] = JSON.parse(value);
    // createNewbookshelfRow(tempObject[key]);
  });
  console.log(tempObject)
  return tempObject;
}

//Local Storage - Get all the LS items, individually store in an object storeBooksObject and push to our main array allLocalStorageBooksArray
function storeLocalStorageItemsToArray() {
  console.log("storeLocalStorageItemsToArray is called")
  const keys = Object.keys(localStorage);
  let storeBooksObject = {};
  //Get each key and value from LS and create a book shelf row from the value
  keys.forEach(key => {
    console.log(key);
    const value = localStorage.getItem(key);
    //LS data stored as an object
    storeBooksObject = JSON.parse(value);
    console.log(storeBooksObject)
    console.log("storeBooksObject pushed to allLocalStorageBooksArray ")
    //LS data object pushed to our main array
    allLocalStorageBooksArray.push(storeBooksObject)
  });
  console.log(storeBooksObject)
  console.log(allLocalStorageBooksArray)
  console.log("reassign storeBooksObject to empty object")
  storeBooksObject = {};
  console.log(storeBooksObject)
  // loop and put into array
  let bookInLocalStorage = []
  // let displayBookDataArray = [] // filtered list, based on category
  let currentCategory = ''

  // filter and sort array based on criteria
  // function filterAndSort() {}
  // booksToDisplay.sort((book) => {})

  // loop over array to create bookshelf rows
  populateBookshelf(allLocalStorageBooksArray);
  return allLocalStorageBooksArray;
}

function clearBookshelf() {
  console.log("clearBookshelf is called")
  mainBookshelfContainer.innerHTML = '';
  while (mainBookshelfContainer.firstChild){
    mainBookshelfContainer.removeChild(mainBookshelfContainer.firstChild)
  }
  console.log(mainBookshelfContainer)
}

// const allLsObjects = getAllLocalStorageItems();
const allLSObjects = allLocalStorageBooksArray
console.log(allLSObjects)

//Add button in search modal to save selected book and ratings into LS
addBtn.addEventListener('click', (e)=> {
  e.preventDefault();
  console.log("addBtn clicked")
  validateForm();
  saveRatings();
  toggleModalOn();
  titleInput.value = "";
  ratingInput.value = "";
})

//Add book modal form validation
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

//Rating is saved to LS and a temporary addBookObj is cleared
function saveRatings() {
  console.log("saveRatings is called")
  //alert if rating is not a value 1 - 5
  if(isNaN(ratingInput.value) || ratingInput.value < 1 || ratingInput.value > 5) {
    alert('Pleae enter a rating value from 1 - 5 only.')
    return false;
  } 
  const newId = addBookObj[`${addBookObj.length}` - 1].id;
  const ratingInputNumber = ratingInput.value;
  addBookObj[`${addBookObj.length}` - 1].ratings = ratingInputNumber
  const lastObj = addBookObj[`${addBookObj.length}` - 1]
  saveToLocalStorage(newId, lastObj);
  refreshPage()
  const lsStoredData = getDataLocalStorage(newId);
  //NEW NOTE: Remove createNewbookshelfRow and replace with storing this in the array of objects that represents data pushed to LS.
  console.log(lsStoredData)
  //clear the object
  addBookObj = [];
}

const bookshelfDivRow = document.createElement("div");

//Map through the allLocalStorageBooksArray and for each book in the array pull the data and create the div that make up the bookshelf, then return that div from this updateListItemforContainer variable where we perform the map
function updateListItemForContainerArray(arrayToUpdate) {
    arrayToUpdate.map(bookItemFromArray => {
      console.log("listItemForContainer has the map method used")
      console.log(bookItemFromArray);

      //create the div that will store the individual book book data to display with attribute "flex-table row"
      const bookshelfDivRow = document.createElement("div");
      bookshelfDivRow.setAttribute("class", "flex-table row");

      const imageDiv = document.createElement("div");
      imageDiv.setAttribute("class", "flex-row imgTitle");
      const imgElem = document.createElement('img');
      // imgElem.src = addBookObj[`${addBookObj.length}` - 1].image;
      imgElem.src = bookItemFromArray.image;
      imgElem.setAttribute("class", "bookImage")
      imageDiv.appendChild(imgElem);

      const titleDiv = document.createElement("div");
      titleDiv.setAttribute("class", "flex-row bookTitle");
      // titleDiv.textContent = addBookObj[`${addBookObj.length}` - 1].title
      titleDiv.setAttribute("data-title-id", bookItemFromArray.id)
      titleDiv.setAttribute("data-title-title", bookItemFromArray.title)
      titleDiv.textContent = bookItemFromArray.title;
      imageDiv.appendChild(titleDiv);
      bookshelfDivRow.appendChild(imageDiv);

      const ratingsDiv = document.createElement("div");
      ratingsDiv.setAttribute("class", "flex-row ratings");
      // ratingsDiv.textContent = addBookObj[`${addBookObj.length}` - 1].ratings
      ratingsDiv.textContent = bookItemFromArray.ratings;
      bookshelfDivRow.appendChild(ratingsDiv);

      const authorDiv = document.createElement("div");
      authorDiv.setAttribute("class", "flex-row author");
      // categoryDiv.textContent = addBookObj[`${addBookObj.length}` - 1].category
      authorDiv.textContent = bookItemFromArray.author;
      bookshelfDivRow.appendChild(authorDiv);

      const firstPublishYearDiv = document.createElement("div");
      firstPublishYearDiv.setAttribute("class", "flex-row firstPublishYear");
      // authorDiv.textContent = addBookObj[`${addBookObj.length}` - 1].author
      firstPublishYearDiv.textContent = bookItemFromArray.firstPublishYear;
      bookshelfDivRow.appendChild(firstPublishYearDiv);

      const buttonsDiv = document.createElement("div");
      buttonsDiv.setAttribute("class", "flex-row bookshelfButtons");
      bookshelfDivRow.appendChild(buttonsDiv);

      const seeMoreDiv = document.createElement("div");
      seeMoreDiv.setAttribute("class", "flex-row");
      const seeMoreBtn = document.createElement("button");
      seeMoreBtn.setAttribute("class", "seeMoreBtn");
      seeMoreBtn.textContent = 'See more';
      buttonsDiv.appendChild(seeMoreDiv);
      seeMoreDiv.appendChild(seeMoreBtn);

      const removeButtonDiv = document.createElement("div");
      removeButtonDiv.setAttribute("class", "flex-row");
      const removeBtn = document.createElement("button");
      removeBtn.setAttribute("class", "removeBtn");
      removeBtn.textContent = 'Remove';
      //Have to add the eventListener before button is added to dom
      removeBtn.addEventListener("click", (e) => {
        console.log(e.target)
        console.log("remove button clicked")
        removeItemLocalStorage(bookItemFromArray.id)
      })
      removeButtonDiv.appendChild(removeBtn);
      buttonsDiv.appendChild(removeButtonDiv);
      mainBookshelfContainer.appendChild(bookshelfDivRow);  
    })
    return bookshelfDivRow;
}

function checkChildElementOfContainer() {
  //Creates it for Each Key from getAllLocalStorageItems function
  //first time it has no childElement
  //second key there will be a childElement and will remove the childElement so it will not work
  const bookshelfContainer = document.getElementById("bookshelfContainer");
  const bookCategoryContainer = document.getElementById("bookCategoryContainer");
  const childElement = document.querySelectorAll(".row");
  if (childElement.length === 0) {
    console.log("childElement does not exist")
    bookshelfContainer.appendChild(bookshelfDivRow);
    return;
  } else if(childElement.length > 0) {
    console.log("childElements found:", childElement);
    console.log("childElement exists")
    if(bookshelfContainer) {
      console.log("bookshelfContainer Exists")
      // bookshelfContainer.removeChild(childElement);
      childElement.forEach(child => {
        child.parentNode.removeChild(child);
      })
      bookshelfContainer.appendChild(bookshelfDivRow);
      return;
    } else if(bookCategoryContainer) {
      console.log("bookCategoryContainer Exists")
      // bookCategoryContainer.removeChild(childElement);
      childElement.forEach(child => {
        child.parentNode.removeChild(child);
      })
      bookshelfContainer.appendChild(bookshelfDivRow);
      return;
    }  
  }
}


//-----Categories Section------
//NEW NOTE: Similar to getAllDataLocalStorageItems so just use one instead.
//Gets all data in local storage put it in allLSObjects variable to use for Browse by Categories
function getAllDataLocalStorage() {
  console.log("getAllDataLocalStorage is called")
  const keys = Object.keys(localStorage);
  const lsObjects = {};
  keys.forEach(key => {
    const value = localStorage.getItem(key);
    lsObjects[key] = JSON.parse(value);
  });
}

// categoryButton.addEventListener('click', getAllCategories)
categoryButton.addEventListener('click', checkIfCategoryDropDownExist)
let groupingByCategory 

//Groups books by category and pushes them to an object groupingByCategory
function createGroupByCategory() {
  groupingByCategory = allLocalStorageBooksArray.reduce((acc, curr) => {
    
    (acc[curr.author] = acc[curr.author] || []).push(curr);
    
    return acc;
  }, {});
  console.log(groupingByCategory)
}

function checkIfCategoryDropDownExist() {
  console.log("checkIfCategoryDropDownExist called")
  createGroupByCategory();
  console.log(groupingByCategory)
  existingElement1 = document.getElementById('categoryListSection');
  existingElement2 = document.getElementById('catUl')
  console.log(existingElement2)
   
  if(!existingElement2) {
    console.log("catUl does not exist")    
    createCategoryDropDownList();
    toggleCategoryModalOn();  
  } else {
    console.log("Unordered List already exists")
    toggleCategoryModalOn();
  }
}

//Create the dropdown list for categories with only one of each category
function createCategoryDropDownList() {
  //Check if the UL has a search list already and if so clear it if retyping a search
  console.log('createCategoryDropDownList was called')
  const parentElement = document.getElementById("categoryListSection");
  const childElement = document.getElementById("catUl")
  categoryInputandListDiv.appendChild(categoryDiv);
  const categoryUl = document.createElement('ul');
  categoryUl.setAttribute("id", "catUl")
  categoryDiv.appendChild(categoryUl);
  //returns an array of key value pairs from an object
  console.log(Object.entries(groupingByCategory))
  const categoryListItems = Object.entries(groupingByCategory).map(([key, value]) => {
    console.log(`${key}: ${value}`)
    let categoryValue = value.forEach(categoryData => {
      console.log(categoryData);
    })

    const categoryLi = document.createElement("li");
    categoryLi.setAttribute("class", "catLi")
    let text = `${key}`
    categoryLi.textContent = text.toUpperCase();
    categoryUl.appendChild(categoryLi);
  })
  const categoryLiForAll = document.createElement("li")
  categoryLiForAll.setAttribute("class", "catLi")
  categoryLiForAll.setAttribute("data-categoryid", "123")
  categoryLiForAll.innerText = "ALL CATEGORIES";
  categoryUl.appendChild(categoryLiForAll);  
}

// //click on category to get the id and show the list of books from that category
categoryList.addEventListener('click', (event) => {
  event.preventDefault();
  console.log("categoryList section clicked");
  
  const target = event.target;
  if(target.tagName === 'LI') {
    console.log("target clicked")
    console.log(target)
    target.classList.add('selectedCategory')
    let selectedCategoryText = target.innerText;
    console.log(selectedCategoryText)
    categoryToBookshelf(selectedCategoryText)
    // target.classList.remove('selectedCategory')
    selectedCategory();
    toggleCategoryModalOff();
  } 
})

function categoryToBookshelf(selectedCategoryText) {
  console.log(selectedCategoryText)
  const categoryListItems = Object.entries(groupingByCategory).filter(([key, value]) => {
    if(key.toUpperCase() === selectedCategoryText) {
      console.log(key)
      console.log(value)
      clearBookshelf();
      console.log("populateBookshelf on value called")
      populateBookshelf(value);    
    }else if(selectedCategoryText === "ALL CATEGORIES") {
      console.log("ALL CATEGORIES CLICKED")
      clearBookshelf();
      populateBookshelf(allLocalStorageBooksArray)  
    }
  })
}

//Remove all the LS items in bookshelf to show only categoy items selected from LS
function removebookshelfItems() {
  console.log("removeBookShelItems called")
  window.removeEventListener('load', console.log('load removed'));
  existingElement1 = document.getElementById('bookCategoryContainer');
  existingElement2 = document.getElementById('bookshelfContainer')
  console.log(existingElement2)
   // const elementToRemove = document.getElementById('bookshelfContainer');
  if(!existingElement1) {
    console.log("bookCategoryContainer does not exist remove bookshelfContainer")
    let elementToRemove = existingElement2;
    console.log(`${elementToRemove} is being removed`)
    elementToRemove.parentNode.removeChild(elementToRemove);
    return;
  } else {
    console.log("bookshelfContainer does not exist remove bookCategoryContainer")
    let elementToRemove = existingElement1;
    console.log(`${elementToRemove} is being removed`)
    elementToRemove.parentNode.removeChild(elementToRemove);
    return;
  }
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

//Create a class .selectedCategory to highlight category selection and prevent duplicating of categories
function selectedCategory() {
  console.log("selectedCategory function called")
  const selectedCategory = document.querySelectorAll(".selectedCategory");
  const catLiCategory = document.querySelectorAll(".catLi");

  //Makes sure only one category item has a selectedCategory class
  catLiCategory.forEach(item => {
    console.log(item)
    item.addEventListener('click', () => {
      catLiCategory.forEach(otherItem => {
        otherItem.classList.remove('selectedCategory');
      });
      item.classList.add('selectedCategory')
    });
  });
}

//Create array to store books that will display in bookshelf
function populateBookshelf(arrayToDisplay) {
  console.log("populateBookshelf is called")
  //clears array and therefore bookshelf
  displayBookDataArray = displayBookDataArray = [];
  //loops through each array and populates array that will display
  arrayToDisplay.forEach(item => {
    // console.log(item)
    displayBookDataArray.push(item)
  })
  displayBookDataArray
  updateListItemForContainerArray(displayBookDataArray);
  return displayBookDataArray;
}

let headingSortTitleIcon = document.querySelector(".titleIcon");
console.log(headingSortTitleIcon)
let headingSortRatingsIcon = document.querySelector(".ratingsIcon");
console.log(headingSortRatingsIcon)
let headingSortAuthorIcon = document.querySelector(".authorIcon");
console.log(headingSortAuthorIcon)
let headingSortFirstPublishYearIcon = document.querySelector(".firstPublishYearIcon");
console.log(headingSortFirstPublishYearIcon)

headingSortTitleIcon.addEventListener('click', () => {
  sortByHeadingIcon(displayBookDataArray, 'title');
  console.log("title icon clicked for sorting")
});

headingSortRatingsIcon.addEventListener('click', () => {
  sortByHeadingIcon(displayBookDataArray, 'ratings');
});

headingSortAuthorIcon.addEventListener('click', () => {
  sortByHeadingIcon(displayBookDataArray, 'author');
});

headingSortFirstPublishYearIcon.addEventListener('click', () => {
  sortByHeadingIcon(displayBookDataArray, 'firstPublishYear');
});

function sortByHeadingIcon(array, property) {
  console.log("sortByHeadingIcon called")
  console.log(property)
  console.log("sortByHeadingIcon called");
  console.log(property)
  array.sort((a, b) => a[property].localeCompare(b[property]));
  clearBookshelf();
  populateBookshelf(array); 
}

//Add book and ratings modal off
function toggleSeeMoreModalOff() {
  console.log("seeMore button off")
  // mainBookshelfContainer.removeChild(mainBookshelfContainer.lastChild)
  let seeMoreContainer = document.getElementById("seeMoreContainer")
  console.log(seeMoreContainer)
  seeMoreContainer.classList.remove("seeMoreNotHidden")
  seeMoreContainer.classList.add("seeMoreHidden")
  //Remove the seeMoreContainer completely so it does not replicate
  mainBookshelfContainer.removeChild(mainBookshelfContainer.lastElementChild) 
}

//Creates the seeMore Modal
function seeMoreData(titleId) {
  if(mainBookshelfContainer.querySelector('#seeMoreContainer')){
    console.log("seeMoreContainer already exists so it was removed")
    // mainBookshelfContainer.removeChild(mainBookshelfContainer.lastElementChild)
  } else {
  console.log("seeMoreData function called and seeMoreContainer didn't exist")
  console.log(titleId)
  let seeMoreDiv = document.createElement("div");
  seeMoreDiv.setAttribute("id", "seeMoreContainer");
  seeMoreDiv.setAttribute("class", "seeMoreNotHidden");
    for(const obj of allLocalStorageBooksArray) {
      if(titleId === obj.id){
        seeMoreDiv.innerHTML += `<div class="seeMoreData"> <button id="btnCloseSeeMore">x</button>
          <p><strong>Title: </strong>${obj.title === "undefined" ? "N/A" : obj.title}</p>
          <p><strong>Author: </strong>${obj.author === "undefined" ? "N/A" : obj.author}</p>
          <p><strong>Publisher: </strong>${obj.publisher === "undefined" ? "N/A" : obj.publisher}</p>
          <p><strong>First Publish Year: </strong>${obj.firstPublishYear === "undefined" ? "N/A" : obj.firstPublishYear}</p>
          <p><strong>Publishing Years: </strong>${obj.publishYear === "undefined" ? "N/A" : obj.publishYear}</p>
          <p><strong>Ratings Average: </strong>${obj.ratingsAverage === "undefined" ? "N/A" : obj.ratingsAverage}</p>
          <p><strong>First Sentence: </strong>${obj.firstSentence === "undefined" ? "N/A" : obj.firstSentence}</p>
        </div> `;
        bookshelfContainer.appendChild(seeMoreDiv);

        let seeMoreContainer = document.querySelector(".seeMoreContainer");
        console.log(seeMoreContainer)

        let seeMoreCloseBtn = document.getElementById('btnCloseSeeMore')
        console.log(seeMoreCloseBtn)
        //button to close See More modal
        seeMoreCloseBtn.addEventListener("click", toggleSeeMoreModalOff); 
      }
    }
  }
}

