// const testurl = 'https://openlibrary.org/search.json?q=the+lord+of+the+rings'
const url = 'https://openlibrary.org/search.json?q='

const titleInput = document.getElementById("title-input")
const addBookButtonElement = document.getElementById("addBookButtonModal")
const modalCloseBtn = document.getElementById("btnCloseModal")
let modal = document.getElementById("modal")
let query = titleInput.value.toLowerCase()
const searchDiv = document.getElementById("searchResults")
const searchHidden = document.querySelector(".searchHidden")
console.log(searchDiv)
console.log(searchHidden)
let searchArray = []
const unorderedList = document.createElement('ul');
const loader = document.getElementById('loader')

//Toggle Add Book Modal
function toggleModal() {
  modal.classList.toggle("hidden")
}

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

const processChange = debounce(() => inputSearch());

//event listener for each keyup release
titleInput.addEventListener("keyup", processChange);

//search books from API
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
  li.textContent = doc.title;
  li.setAttribute("data-key", doc.key)
  li.setAttribute("data-image", attributeForIsbn(doc))
  // console.log(`https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}`)
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
  console.log(categorySubjectFacetArray)
  const categorySubjectArray = doc?.subject;
  console.log(categorySubjectArray)
  const finalCategory = categorySubjectArray?.slice(0, 4).join(", ");
  console.log(finalCategory)
  let finalCategoryText = finalCategory === undefined ? "N/A" : finalCategory;
  console.log(finalCategoryText)
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
  console.log(event)
  console.log(target)
  if(target.tagName = 'li') {
    console.log('if for event works')
    target.classList.add('selected');
    let selectedTitleKey = target.dataset.key
    console.log(selectedTitleKey)
    retrieveBookTitleKey(selectedTitleKey)
  }
})

function retrieveBookTitleKey(selectedTitleKey){
  console.log(selectedTitleKey)
  console.log(`${selectedTitleKey} has been retrieved `)
  createBookObject(selectedTitleKey)
}

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
      console.log(newObject)
      addBookObj.push(newObject)
      console.log(addBookObj)
    }
  })
}



