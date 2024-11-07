const testurl = 'https://openlibrary.org/search.json?q=the+lord+of+the+rings'
const url = 'https://openlibrary.org/search.json?q='




const titleInput = document.getElementById("title-input")
const addBookButtonElement = document.getElementById("addBookButtonModal")
const modalCloseBtn = document.getElementById("btnCloseModal")
let modal = document.getElementById("modal")
let query = titleInput.value.toLowerCase()
console.log(query)
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
console.log(addBookObj)



// function inputSearch(){
//   //call the bookSearch function with the typed in value
//   console.log("input search called")
//   bookSearch(titleInput.value)
  
// }

function debounce(func, timeout = 600){
  console.log("debounce called")
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}
function inputSearch(){
  //call the bookSearch function with the typed in value
  console.log("input search called")
  bookSearch(titleInput.value)
  
}
const processChange = debounce(() => inputSearch());

//event listener for each key
// titleInput.addEventListener("keyup", inputSearch);
titleInput.addEventListener("keyup", processChange);



//Todo: Impliment Debouncing
//search
function bookSearch(query) {
  //replace any space in text with a + for the newquery
  console.log("booksearch called")
  let newquery = query.replace(/\s/g, "+");
  var url = 'https://openlibrary.org/search.json?q=' + newquery;
  // for(i = 0; i < 100; i++)
 
  
  // console.log(newquery)
  // console.log(url)
// console.log(bookSearch())

  fetch(url)
  .then(res => {
    return res.json();
  })
  .then(data => {
    let { docs } = data;
    // console.log(url)
    // addBookObj.id = newquery;
    // console.log(addBookObj.id)
    //Notes: call the function that will add the dropdown items under your searchbar
    //Notes: function needs to have a + for space bar
    //Notes: do forEach now but then use map to put it in an array
    //Notes: add to array then create a li for each book with different data-title data-author attributes etc,
    //You can use this to then when using the eventlistener when clicking on the book to pull the data needed
    console.log(docs.title)
    docs.forEach((doc, index) => {
      // console.log(doc)
      // console.log(doc.title)
      // console.log(doc.work)
      // let docTitle = doc.title
      searchArray.push(doc.title)
    })
    // console.log(searchArray)
    // console.log(data.docs.subject)
    // console.log(data)
    // console.log(data.docs[0].subject[0]) //The Lord of the Rings
    // console.log(data.docs[0].subject) //multiple search fields
    // const firstFive = data.docs.slice(0, 5)
    // console.log(firstFive)
    // const firstFiveLoop = [];
    // for(let i = 0; i < 5; i++){
    //   // firstFiveLoop.push(data.docs[i].stringify(subject[i]))
    //   if(i <= firstFive.length){
    //     console.log(firstFive[i].title) //title
    //     console.log(firstFive[i].author_name) //author
    //     console.log(firstFive[i].subject.indexOf("Fiction")) //index of Fiction
    //     console.log(firstFive[i].subject.includes("Fiction")) // if true Fiction is in array
    //   }
    // }
    
    
  })
}

//   fetch(url)
//   .then(res => {
//     return res.json();
//   })
// }
// .then(data => {

// })

// bookSearch(titleInput.value)

function searchDropDown(){

}