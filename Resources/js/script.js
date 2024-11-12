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

//Toggle Add Book Modal
function toggleModal() {
  modal.classList.toggle("hidden")
}

addBookButtonElement.addEventListener("click", toggleModal);
modalCloseBtn.addEventListener("click", toggleModal);

//object for storing books
const addBookObj = {
  id: titleInput.value.toLowerCase()
}

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
    //Notes: call the function that will add the dropdown items under your searchbar
    //Notes: function needs to have a + for space bar
    //Notes: do forEach now but then use map to put it in an array
    //Notes: add to array then create a li for each book with different data-title data-author attributes etc,
    //You can use this to then when using the eventlistener when clicking on the book to pull the data needed
    // console.log(docs.title)
    docs.forEach((doc, index) => {
      searchArray.push(doc.title)
    })
    // console.log(searchArray)
    arrayToUnorderedList(searchArray)
    
    
    //     console.log(firstFive[i].title) //title
    //     console.log(firstFive[i].author_name) //author
    //     console.log(firstFive[i].subject.indexOf("Fiction")) //index of Fiction
    //     console.log(firstFive[i].subject.includes("Fiction")) // if true Fiction is in array  
  })
}

//Create the UL from the array of books that match the search
function arrayToUnorderedList(array){
  //create elements for ul
  console.log("arraytoUnorderedList is set off")
  const unorderedList = document.createElement('ul');
  unorderedList.setAttribute("id", "searchList");
  //creat li list elements with data from API
  array.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    unorderedList.appendChild(li);
  })
  searchDiv.appendChild(unorderedList);
  toggleSearchModal();
  return unorderedList;
}

//toggle the dropdown search area when typing in input
function toggleSearchModal() {
  console.log("toggleSearchModal function is called inside arraytoUnorderedList")
  searchHidden.classList.toggle("searchHidden")
}

//Select the book from search drop down add a classList and color
searchDiv.addEventListener('click', (event) => {
  event.preventDefault();
  const target = event.target;
  console.log(event)
  if(target.tagName = 'li') {
    console.log('if for event works')
    target.classList.add('selected');
  }
})

