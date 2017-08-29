function Storage() {
	this.store = null;

	this.init = function(key, store, onrequesterror, onrequestsuccess, onupgradeerror) {
		this.store = store || this.store;
		window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
		window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
		window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
		var dBOpenRequest = window.indexedDB.open(this.store, 1);

		dBOpenRequest.onerror = onrequesterrorl;

		dBOpenRequest.onsuccess = onrequestsuccess;

		dBOpenRequest.onupgradeneeded = function(event) {
			var db = event.target.result;

			db.onerror = onupgradeerror;

			var objectStore = db.createObjectStore(store, { keyPath: key });
		};
	};

	this.getData = function(store, onsuccess, oncomplete, onerror) {
		this.store = store || this.store;
		var transaction = db.transaction(this.store);
		var objectStore = transaction.objectStore(this.store);
		var result = [];
		
		transaction.oncomplete = oncomplete;

		transaction.onerror = onerror;

		objectStore.openCursor().onsuccess = function(event) {
			var cursor = event.target.result;
			if(cursor) {
				result.push(cursor.value);
				cursor.continue();
			} else if(onsuccess) {
				onsuccess(result);
			}
		};
	};

	this.setData = function(data, store, onsuccess, oncomplete, onerror) {
		this.store = store || this.store;
		var transaction = db.transaction([this.store], "readwrite");
		
		transaction.oncomplete = oncomplete;
		transaction.onerror = onerror;
		transaction.objectStore(this.store).add(data).onsuccess = onsuccess;
	};

	this.deleteData = function(key, store, onsuccess, oncomplete, onerror) {
		this.store = store || this.store;
		var transaction = db.transaction([this.store], "readwrite");

		transaction.onerror = onerror;
		transaction.oncomplete = oncomplete;
		transaction.objectStore(this.store).delete(key).onsuccess = onsuccess;
	};
}