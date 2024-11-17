// const testurl = 'https://openlibrary.org/search.json?q=the+lord+of+the+rings'
const url = 'https://openlibrary.org/search.json?q='

const titleInput = document.getElementById("title-input")
const addBookButtonElement = document.getElementById("addBookButtonModal")
const modalCloseBtn = document.getElementById("btnCloseModal")
let modal = document.getElementById("modal")
let query = titleInput.value.toLowerCase()
const searchDiv = document.getElementById("searchResults")
const searchHidden = document.querySelector(".searchHidden")
console.log(searchHidden)
let searchArray = []
const unorderedList = document.createElement('ul');
const loader = document.getElementById('loader')
const addBtn = document.getElementById('modalButton')
const ratingInput = document.getElementById("rating-input")


//Toggle Add Book Modal
function toggleModal() {
  modal.classList.toggle("hidden")
}
//Event Listeners for Add Book Modal
addBookButtonElement.addEventListener("click", toggleModal);
modalCloseBtn.addEventListener("click", toggleModal);

//object for storing books
const addBookObj = [
]

//Debouncing so search waits to make the get call to the API and not on every keystroke
function debounce(func, timeout = 600){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

function inputSearch(){
  //call the bookSearch function with the typed in value
  bookSearch(titleInput.value);
}

//Debounce called on inputSearch
const processChange = debounce(() => inputSearch());

//Event listener for each keyup release
titleInput.addEventListener("keyup", processChange);

//Search books from API
function bookSearch(query) {
  loader.style.display = "block";
  //replace any space in text with a + for the newquery
  console.log("booksearch called")
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
  loader.style.display= "none";
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

//image function to add to attribute
function attributeForIsbn(doc) {
  const imgIsbn = doc.isbn?.[0]
  const imgUrl = `https://covers.openlibrary.org/b/isbn/${imgIsbn}`
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
  searchDiv.appendChild(unorderedList);
  toggleSearchModal();
  return unorderedList;
}

//toggle the dropdown search area when typing in input
function toggleSearchModal() {
  console.log("toggleSearchModal function is called inside ddSearchListToDropDown")
  searchHidden.classList.toggle("searchHidden")
}

//Select the book from search drop down list add a classList and color and pull the book key
searchDiv.addEventListener('click', (event) => {
  event.preventDefault();
  const target = event.target;
  if(target.tagName = 'li') {
    target.classList.add('selected');
    let selectedTitleKey = target.dataset.key
    console.log(selectedTitleKey)
    retrieveBookTitleKey(selectedTitleKey)
    //close the search drop down modal after selecting book title
    toggleSearchModal();
  }
})

function retrieveBookTitleKey(selectedTitleKey){
  console.log(`${selectedTitleKey} has been retrieved via retrieveBookTitleKey function`)
  createBookObject(selectedTitleKey)
  let finalSelectedTitleKey = selectedTitleKey
  return finalSelectedTitleKey
}

function addRatings(selectedTitleKey) {
  console.log("addRatings function has been called")
  console.log(selectedTitleKey)
}

ratingInput.addEventListener('click', (e)=> {
  e.preventDefault();

})

function createBookObject(selectedTitleKey) {
  console.log("createBookObject was called")
  const targetId = selectedTitleKey;
  searchDiv.querySelectorAll('li').forEach(li => {   
    if (li.dataset.key === targetId) {
      const newObject = {
          id: `${li.dataset.key}`,
          image: `${li.dataset.image}`,
          title: `${li.dataset.title}`,
          author: `${li.dataset.author}`,
          category: `${li.dataset.category}`
       }
      addBookObj.push(newObject)
      console.log(addBookObj)
      // saveToLocalStorage(targetId, newObject)
    }
  })
}

function saveToLocalStorage(targetId, newObject) {
  localStorage.setItem(targetId, JSON.stringify(newObject))
  console.log(localStorage)
}

addBtn.addEventListener('click', (e)=> {
  e.preventDefault();
  validateForm();
  saveRatings();
  toggleModal();
})

function validateForm() {
  const titleInputValue = titleInput.value;
  console.log(titleInputValue)
  const ratingInputValue = ratingInput.value;
  console.log(ratingInputValue)

  if(titleInputValue === '' || ratingInputValue === '') {
    alert('Please fill in all fields.')
    return false;
  }
    return true;
}

function saveRatings() {
  const newId = addBookObj[`${addBookObj.length}` - 1].id;
  const ratingInputNumber = ratingInput.value;
  addBookObj[`${addBookObj.length}` - 1].ratings = ratingInputNumber
  const lastObj = addBookObj[`${addBookObj.length}` - 1]
  saveToLocalStorage(newId, lastObj);
}



