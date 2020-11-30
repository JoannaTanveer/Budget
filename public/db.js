let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedD

let db;
let request = indexedDB.open("database", 1);

request.onupgradeneeded = function(event) {
    var db = event.target.result;
   
    // Create an objectStore for this database
   
    var objectStore = db.createObjectStore("offlineDB", { autoIncrement: true });
   
    // define what data items the objectStore will contain
   
    objectStore.createIndex("name", "name", { unique: false });
    objectStore.createIndex("value", "value", { unique: false });
    objectStore.createIndex("date", "date", { unique: false });
    
    
   
   
};

request.onsuccess = event => {
    db = event.target.result;
  
    // check if app is online before checking offlineDB
    if (navigator.onLine) {
      getAll();
    }
};

function addData(data) {
    const transaction = db.transaction(['offlineDB'], 'readwrite');
    const store = transaction.objectStore('offlineDB');

    store.add(data) 
};

function getAll() {
    // create a transaction on the pending db with readwrite access
    const transaction = db.transaction(["offlineDB"], "readwrite");
    // access your object store
    let store = transaction.objectStore("offlineDB");
    // get all 
    const getAll = store.getAll();
  
    getAll.onsuccess = function() {
      if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
        })
        .then(response => response.json())
        .then(() => {
          
          const transaction = db.transaction(["offlineDB"], "readwrite");
          let store = transaction.objectStore("offlineDB");
          store.clear();
        });
      }
    };
  }

function getTransactions() {
    return new Promise((resolve, reject) => {
    const transaction = db.transaction(["offlineDB"], "readwrite");
    let store = transaction.objectStore("offlineDB");
    const getAll = store.getAll();

    getAll.onsuccess = function() {
      resolve(getAll.result);
    };
  })
}
  window.addEventListener("online", getAll);
